-- ============================================================================
-- Migration: gallery_records table, storage bucket, and policies
-- ============================================================================
--
-- Creates the public.gallery_records table for the photographic archive.
-- Images are stored in the gallery-photos Supabase Storage bucket; only the
-- object path is persisted in PostgreSQL.
-- ============================================================================

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gallery_records (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text,
  album       text,        -- optional album/category label
  branch      text,
  year_label  text,
  image_path  text        NOT NULL,
  is_published boolean    NOT NULL DEFAULT true,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gallery_records_published_sort_idx
  ON public.gallery_records (is_published, sort_order);

CREATE INDEX IF NOT EXISTS gallery_records_album_idx
  ON public.gallery_records (album);

CREATE INDEX IF NOT EXISTS gallery_records_branch_idx
  ON public.gallery_records (branch);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.set_gallery_records_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gallery_records_updated_at ON public.gallery_records;
CREATE TRIGGER gallery_records_updated_at
  BEFORE UPDATE ON public.gallery_records
  FOR EACH ROW
  EXECUTE FUNCTION public.set_gallery_records_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.gallery_records ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated visitors may read published records
DROP POLICY IF EXISTS "gallery_public_read" ON public.gallery_records;
CREATE POLICY "gallery_public_read"
  ON public.gallery_records
  FOR SELECT
  USING (is_published = true);

-- Admin users (admin or secretary) may read all records including drafts
DROP POLICY IF EXISTS "gallery_admin_read" ON public.gallery_records;
CREATE POLICY "gallery_admin_read"
  ON public.gallery_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );

DROP POLICY IF EXISTS "gallery_admin_insert" ON public.gallery_records;
CREATE POLICY "gallery_admin_insert"
  ON public.gallery_records
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );

DROP POLICY IF EXISTS "gallery_admin_update" ON public.gallery_records;
CREATE POLICY "gallery_admin_update"
  ON public.gallery_records
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

DROP POLICY IF EXISTS "gallery_admin_delete" ON public.gallery_records;
CREATE POLICY "gallery_admin_delete"
  ON public.gallery_records
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );

-- ── Storage bucket ───────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-photos',
  'gallery-photos',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read access to gallery photos
DROP POLICY IF EXISTS "gallery_photos_public_read" ON storage.objects;
CREATE POLICY "gallery_photos_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery-photos');

-- Admin upload / update / delete
DROP POLICY IF EXISTS "gallery_photos_admin_insert" ON storage.objects;
CREATE POLICY "gallery_photos_admin_insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-photos'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );

DROP POLICY IF EXISTS "gallery_photos_admin_update" ON storage.objects;
CREATE POLICY "gallery_photos_admin_update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'gallery-photos'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );

DROP POLICY IF EXISTS "gallery_photos_admin_delete" ON storage.objects;
CREATE POLICY "gallery_photos_admin_delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'gallery-photos'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'secretary')
    )
  );
