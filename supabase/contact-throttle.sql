-- Contact-form rate limit, shared across serverless instances.
--
-- Run this once in the Supabase SQL editor. Until the table exists the API
-- route falls back to a per-instance in-memory limiter, which is weaker but
-- keeps the form working.
--
-- Rows store a SHA-256 hash of the client IP (never the address itself) and are
-- deleted as soon as their window expires.

create table if not exists public.contact_throttle (
  key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null
);

create index if not exists contact_throttle_reset_at_idx
  on public.contact_throttle (reset_at);

-- Row-level security stays on with no policies: anon and authenticated roles
-- can neither read nor write this table. Only the service-role key (used by the
-- API route, server-side only) bypasses RLS.
alter table public.contact_throttle enable row level security;

revoke all on public.contact_throttle from anon, authenticated;
