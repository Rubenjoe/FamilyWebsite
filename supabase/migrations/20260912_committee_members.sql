-- ============================================================================
-- Migration: committee_members table for year-based executive committee archive
-- ============================================================================
--
-- Creates the public.committee_members table to support historical committee
-- records organized by year. This replaces the heritage_records kind="committee"
-- approach with a dedicated year-based archival system.
-- ============================================================================

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.committee_members (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_year   integer     NOT NULL,
  name             text        NOT NULL,
  role             text        NOT NULL,
  branch           text,
  location         text,
  image_url        text,
  sort_order       integer     NOT NULL DEFAULT 0,
  is_published     boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS committee_members_year_idx
  ON public.committee_members (committee_year DESC);

CREATE INDEX IF NOT EXISTS committee_members_published_idx
  ON public.committee_members (is_published, committee_year DESC, sort_order);

CREATE INDEX IF NOT EXISTS committee_members_branch_idx
  ON public.committee_members (branch);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.set_committee_members_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS committee_members_updated_at ON public.committee_members;
CREATE TRIGGER committee_members_updated_at
  BEFORE UPDATE ON public.committee_members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_committee_members_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated visitors may read published records
DROP POLICY IF EXISTS "committee_public_read" ON public.committee_members;
CREATE POLICY "committee_public_read"
  ON public.committee_members
  FOR SELECT
  USING (is_published = true);

-- Admin users (admin or secretary) may read all records including drafts
DROP POLICY IF EXISTS "committee_admin_read" ON public.committee_members;
CREATE POLICY "committee_admin_read"
  ON public.committee_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );

DROP POLICY IF EXISTS "committee_admin_insert" ON public.committee_members;
CREATE POLICY "committee_admin_insert"
  ON public.committee_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );

DROP POLICY IF EXISTS "committee_admin_update" ON public.committee_members;
CREATE POLICY "committee_admin_update"
  ON public.committee_members
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

DROP POLICY IF EXISTS "committee_admin_delete" ON public.committee_members;
CREATE POLICY "committee_admin_delete"
  ON public.committee_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );

-- ── Comments ────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.committee_members IS 'Executive committee members organized by year for historical archive';
COMMENT ON COLUMN public.committee_members.committee_year IS 'The year this committee served (e.g., 2025)';
COMMENT ON COLUMN public.committee_members.name IS 'Full name of the committee member';
COMMENT ON COLUMN public.committee_members.role IS 'Committee role (e.g., President, Secretary, Treasurer, Committee Member)';
COMMENT ON COLUMN public.committee_members.branch IS 'Family branch (optional)';
COMMENT ON COLUMN public.committee_members.location IS 'Location (optional)';
COMMENT ON COLUMN public.committee_members.image_url IS 'URL to member photo (optional)';
COMMENT ON COLUMN public.committee_members.sort_order IS 'Display order within the year';
COMMENT ON COLUMN public.committee_members.is_published IS 'Whether to show on public website';
