-- Members: admin/secretary write policies.
--
-- Found while testing the CSV import: the members table allowed public SELECT
-- but had no INSERT, UPDATE or DELETE policy, so every write from the admin UI
-- (Add Member, Edit member, Delete member) failed with
--   403  new row violates row-level security policy for table "members"
-- The 721 existing rows were seeded directly, which hid the gap.
--
-- This mirrors the predicate the other admin-managed tables use
-- (see 20260912_committee_members.sql): the signed-in user must exist in
-- public.admin_users with role admin or secretary.

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_admin_insert" ON public.members;
CREATE POLICY "members_admin_insert"
  ON public.members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );

DROP POLICY IF EXISTS "members_admin_update" ON public.members;
CREATE POLICY "members_admin_update"
  ON public.members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );

DROP POLICY IF EXISTS "members_admin_delete" ON public.members;
CREATE POLICY "members_admin_delete"
  ON public.members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );

-- The public site reads the registry, so SELECT stays as it is.
