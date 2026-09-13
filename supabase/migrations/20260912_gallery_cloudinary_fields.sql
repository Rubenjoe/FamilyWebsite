-- ============================================================================
-- Migration: Add Cloudinary fields to gallery_records table
-- ============================================================================
--
-- Adds Cloudinary-specific fields to the existing gallery_records table
-- to support Cloudinary image storage and delivery.
-- ============================================================================

-- ── Add Cloudinary fields ───────────────────────────────────────────────────

ALTER TABLE public.gallery_records
  ADD COLUMN IF NOT EXISTS cloudinary_public_id text,
  ADD COLUMN IF NOT EXISTS cloudinary_secure_url text;

-- Add comments
COMMENT ON COLUMN public.gallery_records.cloudinary_public_id IS 'Cloudinary public_id for the image (canonical reference)';
COMMENT ON COLUMN public.gallery_records.cloudinary_secure_url IS 'Cloudinary secure URL (optional backup reference)';

-- ── Index for Cloudinary lookups ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS gallery_records_cloudinary_id_idx
  ON public.gallery_records (cloudinary_public_id) WHERE cloudinary_public_id IS NOT NULL;

-- ── Note on data migration ───────────────────────────────────────────────────
-- 
-- Existing gallery_records will have cloudinary_public_id and cloudinary_secure_url as NULL.
-- New gallery uploads will populate these fields with Cloudinary values.
-- The image_path field remains for backward compatibility with existing Supabase Storage images.
-- New records can use either Supabase Storage (image_path) or Cloudinary (cloudinary_public_id).
