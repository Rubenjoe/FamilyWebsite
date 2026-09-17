-- ============================================================================
-- Migration: Split heritage_records public SELECT from admin helper
-- ============================================================================
--
-- PROBLEM
--   heritage_records_public_read currently uses:
--     is_published OR (select public.can_manage_heritage_records())
--
--   can_manage_heritage_records() is a SECURITY DEFINER helper whose EXECUTE
--   privilege is revoked from PUBLIC and anon (admins only). PostgreSQL still
--   evaluates that function as part of the public SELECT policy, so anonymous
--   homepage / achievers / obituary queries fail with:
--     42501 permission denied for function can_manage_heritage_records
--
-- FIX
--   Match gallery_records / committee_members:
--   - public SELECT only checks is_published
--   - staff SELECT of drafts stays on authenticated + the admin helper
--
-- SAFETY
--   Insert / update / delete policies are unchanged.
--   Unpublished rows remain hidden from anon.
-- ============================================================================

DROP POLICY IF EXISTS "heritage_records_public_read" ON public.heritage_records;
DROP POLICY IF EXISTS "heritage_records_staff_read" ON public.heritage_records;

CREATE POLICY "heritage_records_public_read"
  ON public.heritage_records
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "heritage_records_staff_read"
  ON public.heritage_records
  FOR SELECT
  TO authenticated
  USING ((select public.can_manage_heritage_records()));
