import { createHash } from "node:crypto";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Contact-form rate limit.
 *
 * Serverless instances do not share memory, so an in-memory counter only
 * throttles one instance at a time — a bot spread across instances walks
 * straight through. When SUPABASE_SERVICE_ROLE_KEY is configured the counter
 * lives in the `contact_throttle` table (see supabase/contact-throttle.sql) and
 * is shared by every instance. Without the key, or if the table is missing, it
 * degrades to the in-memory limiter rather than failing the request.
 *
 * Keys are SHA-256 hashes of the client IP, so raw addresses are never stored.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const SALT = process.env.CONTACT_THROTTLE_SALT ?? "pulazhiyil-contact-v1";

type Bucket = { count: number; resetAt: number };

const memory: Map<string, Bucket> =
  (globalThis as { __contactThrottle?: Map<string, Bucket> }).__contactThrottle ??
  new Map();
(globalThis as { __contactThrottle?: Map<string, Bucket> }).__contactThrottle =
  memory;

function hashKey(ip: string): string {
  return createHash("sha256").update(`${SALT}:${ip}`).digest("hex").slice(0, 40);
}

/** In-memory fallback: correct per instance, blind across them. */
function consumeMemory(key: string): number | null {
  const now = Date.now();

  if (memory.size > 500) {
    for (const [entryKey, bucket] of memory) {
      if (bucket.resetAt <= now) memory.delete(entryKey);
    }
  }

  const bucket = memory.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  if (bucket.count >= MAX_REQUESTS) {
    return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  }
  bucket.count += 1;
  return null;
}

/**
 * Records one request against the caller's quota.
 * Returns the seconds to wait when over the limit, otherwise null.
 */
export async function consumeContactQuota(ip: string): Promise<number | null> {
  const key = hashKey(ip);
  const admin = createAdminClient();
  if (!admin) return consumeMemory(key);

  const now = Date.now();

  try {
    const { data, error } = await admin
      .from("contact_throttle")
      .select("count, reset_at")
      .eq("key", key)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { error: insertError } = await admin
        .from("contact_throttle")
        .insert({ key, count: 1, reset_at: new Date(now + WINDOW_MS).toISOString() });
      // A concurrent insert may win the race; either way the caller is allowed.
      if (insertError && insertError.code !== "23505") throw insertError;
      return null;
    }

    const resetAt = new Date(data.reset_at as string).getTime();
    if (resetAt <= now) {
      await admin
        .from("contact_throttle")
        .update({ count: 1, reset_at: new Date(now + WINDOW_MS).toISOString() })
        .eq("key", key);
      return null;
    }

    if ((data.count as number) >= MAX_REQUESTS) {
      return Math.max(1, Math.ceil((resetAt - now) / 1000));
    }

    const { error: updateError } = await admin
      .from("contact_throttle")
      .update({ count: (data.count as number) + 1 })
      .eq("key", key);
    if (updateError) throw updateError;

    // Housekeeping: expired rows are useless and would grow forever.
    void admin
      .from("contact_throttle")
      .delete()
      .lt("reset_at", new Date(now).toISOString())
      .then(() => undefined, () => undefined);

    return null;
  } catch (error) {
    console.error(
      "[Contact] Persistent throttle unavailable, using in-memory fallback:",
      error instanceof Error ? error.message : error
    );
    return consumeMemory(key);
  }
}
