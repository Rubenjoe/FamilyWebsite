-- Trigger function to record audit log rows for members/events.
-- This runs as SECURITY DEFINER so it can write to audit_log regardless of RLS.
CREATE OR REPLACE FUNCTION public.record_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_action text;
  v_changes jsonb;
  v_target_id text;
BEGIN
  v_user_id := auth.uid();

  IF TG_OP = 'INSERT' THEN
    v_action := TG_TABLE_NAME || '.create';
    v_target_id := NEW.id::text;
    v_changes := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := TG_TABLE_NAME || '.update';
    v_target_id := NEW.id::text;
    v_changes := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_action := TG_TABLE_NAME || '.delete';
    v_target_id := OLD.id::text;
    v_changes := to_jsonb(OLD);
  END IF;

  INSERT INTO public.audit_log (user_id, action, target_id, changes)
  VALUES (v_user_id, v_action, v_target_id, v_changes);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Drop existing triggers if any to make the migration idempotent
DROP TRIGGER IF EXISTS audit_members ON public.members;
DROP TRIGGER IF EXISTS audit_events ON public.events;

CREATE TRIGGER audit_members
  AFTER INSERT OR UPDATE OR DELETE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.record_audit_log();

CREATE TRIGGER audit_events
  AFTER INSERT OR UPDATE OR DELETE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.record_audit_log();
