-- Helper functions for admin role management.

-- Look up a user id by email from the auth schema.
-- SECURITY DEFINER is required to read auth.users; this function only returns the id.
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id
  FROM auth.users
  WHERE email = get_user_id_by_email.email
  LIMIT 1;
$$;

-- Optional: expose a list of admin users with their auth email for the admin UI.
-- Only callable by admin users due to the admin_users select policy.
CREATE OR REPLACE FUNCTION public.list_admin_users_with_email()
RETURNS TABLE (id uuid, role public.app_role, created_at timestamptz, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT au.id, au.role, au.created_at, u.email
  FROM public.admin_users au
  JOIN auth.users u ON u.id = au.id;
$$;
