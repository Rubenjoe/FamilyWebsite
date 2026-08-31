-- ============================================================================
-- Migration: Mark known seeded / demo heritage records as placeholder
-- ============================================================================
--
-- PURPOSE
--   Several heritage_records rows were inserted during development as example
--   or placeholder content. They are not real family records and must not
--   appear on public pages.
--
--   The homepage, achievers page, and all public queries already filter on:
--     is_published = true  AND  is_placeholder = false
--
--   This migration sets is_placeholder = true and is_published = false for
--   known demo records so they are correctly excluded.
--
-- CRITERIA FOR INCLUSION
--   A record is included only when its name exactly matches a string that
--   originates from the development-time hardcoded constants
--   (ACHIEVEMENTS / EVANGELISTS in app/page.tsx and app/achievers/page.tsx),
--   not from any admin-submitted or real family content.
--
--   Records with real images or that were submitted through the admin dashboard
--   by a family member are NOT touched by this migration.
--
-- SAFETY
--   This statement is idempotent: re-running it changes nothing on rows that
--   are already marked is_placeholder = true.
--
-- APPLY THIS MIGRATION
--   Run in the Supabase dashboard → SQL Editor, or via the Supabase CLI:
--     supabase db execute --file supabase/migrations/20260831_mark_placeholder_records.sql
-- ============================================================================

UPDATE public.heritage_records
SET
  is_placeholder = true,
  is_published   = false
WHERE
  name IN (
    'Submit an Achievement',
    'Submit an Evangelist',
    'Fr. Thomas Pullazhiyil',
    'Sr. Mary Thykurinjiyil',
    'Deacon Jose Thanuvelil'
  )
  AND is_placeholder = false;  -- idempotent: skip rows already marked

-- ── Verification query (optional — run after to confirm) ──────────────────
-- SELECT id, kind, name, is_placeholder, is_published
-- FROM public.heritage_records
-- WHERE name IN (
--   'Submit an Achievement',
--   'Submit an Evangelist',
--   'Fr. Thomas Pullazhiyil',
--   'Sr. Mary Thykurinjiyil',
--   'Deacon Jose Thanuvelil'
-- );
