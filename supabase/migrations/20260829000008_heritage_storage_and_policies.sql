-- Storage bucket and policies for heritage record photos.
-- Reuses the same public-read / admin-write pattern as member-photos.

INSERT INTO storage.buckets (id, name, public)
VALUES ('heritage-photos', 'heritage-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "heritage_photos_select_public"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'heritage-photos');

CREATE POLICY "heritage_photos_upload_admin"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'heritage-photos'
    AND public.can_manage_heritage_records()
  );

CREATE POLICY "heritage_photos_delete_admin"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'heritage-photos'
    AND public.can_manage_heritage_records()
  );

-- Update trigger for heritage_records updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS heritage_records_updated_at ON public.heritage_records;
CREATE TRIGGER heritage_records_updated_at
  BEFORE UPDATE ON public.heritage_records
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Add audit trigger for heritage_records
DROP TRIGGER IF EXISTS audit_heritage_records ON public.heritage_records;
CREATE TRIGGER audit_heritage_records
  AFTER INSERT OR UPDATE OR DELETE ON public.heritage_records
  FOR EACH ROW
  EXECUTE FUNCTION public.record_audit_log();
