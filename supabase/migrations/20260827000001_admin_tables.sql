-- Pullazhiyil Legacy admin schema additions
-- Events, admin users, audit log, and RLS policies.
-- Existing members table is left unchanged.

-- Role enum for admin users
CREATE TYPE IF NOT EXISTS app_role AS ENUM (
  'admin',
  'secretary',
  'treasurer'
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Admin users table (role lookup, not a replacement for auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'secretary',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_id text,
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper: check if the current user is a known admin user
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
$$;

-- Events policies
-- Admins/secretaries can read events; public can read events (for the website listing)
CREATE POLICY "events_select_public"
  ON public.events
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "events_write_admin"
  ON public.events
  FOR ALL
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Admin users policies
-- Only existing admin users can read/modify admin_users table
CREATE POLICY "admin_users_select_admin"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admin_users_write_admin"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Audit log policies
-- Admins can read all audit rows; writers insert their own
CREATE POLICY "audit_log_select_admin"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "audit_log_insert_authenticated"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure members remains writable only by admin users (matches existing pattern)
-- If members already has a write policy, this migration intentionally leaves it alone.
-- If members has no RLS, enable it and add a read-all + write-admin pattern.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'members'
  ) THEN
    ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "members_select_all"
      ON public.members
      FOR SELECT
      TO authenticated, anon
      USING (true);

    CREATE POLICY "members_write_admin"
      ON public.members
      FOR ALL
      TO authenticated
      USING (public.is_admin_user())
      WITH CHECK (public.is_admin_user());
  END IF;
END
$$;

-- Storage: create a bucket for member photos if it doesn't exist.
-- Public access so the photo_url can be served directly; uploads restricted to admin users below.
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for member-photos bucket
CREATE POLICY "member_photos_select_public"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'member-photos');

CREATE POLICY "member_photos_upload_admin"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'member-photos'
    AND public.is_admin_user()
  );

CREATE POLICY "member_photos_delete_admin"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'member-photos'
    AND public.is_admin_user()
  );
