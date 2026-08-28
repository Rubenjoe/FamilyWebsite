-- Default Supabase grants can expose SECURITY DEFINER functions through the RPC API.
-- Only authenticated callers need the two administrator-guarded role-management functions.

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.record_audit_log() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_id_by_email(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_dashboard_user(text, text, public.app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_dashboard_user(text, text, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
