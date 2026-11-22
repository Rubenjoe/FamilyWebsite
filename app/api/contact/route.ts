import { NextRequest, NextResponse } from "next/server";

/**
 * Contact form delivery.
 *
 * Sends the committee message through Resend's REST API. Delivery requires
 * three server-side environment variables:
 *   RESEND_API_KEY       – API key from https://resend.com/api-keys
 *   CONTACT_TO_EMAIL     – inbox that should receive the enquiry
 *   CONTACT_FROM_EMAIL   – verified sender, e.g. "Archive Desk <desk@domain.tld>"
 *
 * Until they are set the endpoint answers 503 instead of pretending to send,
 * so the form never reports a delivery that did not happen.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = {
  name: 120,
  email: 200,
  branch: 80,
  subject: 200,
  message: 5000,
} as const;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Basic per-IP throttle so one visitor cannot flood the form.
 *
 * Deliberately in-memory: it needs no infrastructure and stops the realistic
 * case (a script hammering the endpoint). Serverless instances each keep their
 * own counter, so treat it as a speed bump rather than a hard quota — a
 * determined attacker spread across instances still gets through.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

type Bucket = { count: number; resetAt: number };

// `globalThis` keeps the map alive across dev hot reloads.
const buckets: Map<string, Bucket> =
  (globalThis as { __contactThrottle?: Map<string, Bucket> }).__contactThrottle ??
  new Map();
(globalThis as { __contactThrottle?: Map<string, Bucket> }).__contactThrottle = buckets;

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Returns the seconds to wait when the caller is over the limit, else null. */
function throttle(key: string): number | null {
  const now = Date.now();

  // Keep the map from growing without bound under a distributed flood.
  if (buckets.size > 500) {
    for (const [entryKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(entryKey);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (bucket.count >= MAX_REQUESTS) {
    return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  }

  bucket.count += 1;
  return null;
}

export async function POST(request: NextRequest) {
  const retryAfter = throttle(clientKey(request));
  if (retryAfter !== null) {
    const wait =
      retryAfter > 60 ? `${Math.ceil(retryAfter / 60)} minutes` : `${retryAfter} seconds`;
    return NextResponse.json(
      {
        error: `Too many messages from this connection. Please try again in ${wait}, or reach the archive desk by phone.`,
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;

  // Honeypot: a hidden field only bots fill in. Accept silently so the bot
  // does not learn that it was filtered.
  if (text(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = text(body.name, LIMITS.name);
  const email = text(body.email, LIMITS.email);
  const branch = text(body.branch, LIMITS.branch);
  const subject = text(body.subject, LIMITS.subject);
  const message = text(body.message, LIMITS.message);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Your name, email address and message are all required." },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email address does not look valid." },
      { status: 400 }
    );
  }

  if (message.length < 10) {
    return NextResponse.json(
      { error: "Please add a little more detail to your message." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.error(
      "[Contact] Email delivery is not configured. Set RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL."
    );
    return NextResponse.json(
      {
        error:
          "Email delivery is not configured yet. Please contact the archive desk directly by phone or email.",
      },
      { status: 503 }
    );
  }

  const subjectLine = subject
    ? `Archive enquiry — ${subject}`
    : `Archive enquiry from ${name}`;

  const bodyLines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Branch: ${branch || "Not specified"}`,
    subject ? `Subject: ${subject}` : null,
    "",
    message,
    "",
    "— Sent from the Pullazhiyil Kudumbayogam contact form",
  ].filter((line): line is string => line !== null);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: subjectLine,
        text: bodyLines.join("\n"),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        "[Contact] Resend rejected the message:",
        response.status,
        detail.slice(0, 500)
      );
      return NextResponse.json(
        { error: "The archive desk could not be reached. Please try again shortly." },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("[Contact] Failed to reach Resend:", error);
    return NextResponse.json(
      { error: "The archive desk could not be reached. Please try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
