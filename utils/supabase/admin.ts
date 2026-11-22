import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — server only.
 *
 * The anon/publishable client respects RLS, which is correct for everything the
 * signed-in admin does. A few backend jobs (the persistent contact throttle,
 * and any future maintenance task) need to write rows no browser should be able
 * to touch, and those must bypass RLS.
 *
 * Returns `null` when the key is absent so callers can degrade instead of
 * crashing: the contact route falls back to an in-memory limiter.
 *
 * NEVER import this from a client component — the key would ship to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
