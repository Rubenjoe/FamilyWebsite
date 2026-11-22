/**
 * Server bootstrap checks.
 *
 * `register()` runs once when the Node.js server starts, which makes it the
 * right place to shout about missing configuration. Before this existed, a
 * deploy without the Resend variables looked healthy and simply returned 503
 * to anyone who used the contact form — messages were lost with no trace.
 */

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

const CONTACT = [
  "RESEND_API_KEY",
  "CONTACT_TO_EMAIL",
  "CONTACT_FROM_EMAIL",
] as const;

const OPTIONAL = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
] as const;

export async function register() {
  // Only meaningful in the Node.js runtime (not edge).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const missingRequired = REQUIRED.filter((key) => !process.env[key]);
  if (missingRequired.length > 0) {
    console.error(
      `\n[startup] ✖ Missing required environment variables: ${missingRequired.join(", ")}.\n` +
        "          The database will not load until these are set.\n"
    );
  }

  const missingContact = CONTACT.filter((key) => !process.env[key]);
  if (missingContact.length > 0) {
    console.warn(
      `\n[startup] ⚠ Contact form is disabled — missing: ${missingContact.join(", ")}.\n` +
        "          /api/contact will answer 503 to every submission until these are set,\n" +
        "          which means real enquiries are silently refused. See README → Contact form.\n"
    );
  }

  const missingOptional = OPTIONAL.filter((key) => !process.env[key]);
  if (missingOptional.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    console.warn(
      "[startup] ⚠ SUPABASE_SERVICE_ROLE_KEY is not set: the contact rate limit falls back\n" +
        "          to per-instance memory (weaker), and `npm run backup` cannot run."
    );
  }
  if (missingOptional.includes("NEXT_PUBLIC_SITE_URL")) {
    console.warn(
      "[startup] ⚠ NEXT_PUBLIC_SITE_URL is not set: metadata links use http://localhost:3000."
    );
  }
}
