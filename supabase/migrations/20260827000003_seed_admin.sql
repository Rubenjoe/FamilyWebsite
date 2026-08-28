-- Seed initial admin user by email.
-- Replace the email before running in production; the user must already exist in auth.users.
-- Usage:
--   psql ... -v admin_email='admin@example.com' -f 20260827000003_seed_admin.sql
-- Or run directly after editing the email below.

DO $$
DECLARE
  v_admin_email text := 'admin@example.com';
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_admin_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No auth.users row found for %', v_admin_email;
    RETURN;
  END IF;

  INSERT INTO public.admin_users (id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

  RAISE NOTICE 'Admin role granted to % (id=%)', v_admin_email, v_user_id;
END
$$;
