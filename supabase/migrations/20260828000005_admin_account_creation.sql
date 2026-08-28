-- Create confirmed dashboard accounts from the role-management screen.
-- The function is executable only by an existing administrator.

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Administrator access is required' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = lower(trim(p_email))
  LIMIT 1;

  RETURN v_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_dashboard_user(
  p_email text,
  p_password text,
  p_role public.app_role DEFAULT 'secretary'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_user_id uuid := gen_random_uuid();
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Administrator access is required' USING ERRCODE = '42501';
  END IF;

  IF v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'Enter a valid email address' USING ERRCODE = '22023';
  END IF;

  IF length(p_password) < 12 THEN
    RAISE EXCEPTION 'Password must be at least 12 characters' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    RAISE EXCEPTION 'An account with this email already exists' USING ERRCODE = '23505';
  END IF;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
    v_email, crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
    'email', v_email, now(), now(), now()
  );

  INSERT INTO public.admin_users (id, role) VALUES (v_user_id, p_role);
  INSERT INTO public.audit_log (user_id, action, target_id, changes)
  VALUES (auth.uid(), 'admin_users.create', v_user_id::text, jsonb_build_object('email', v_email, 'role', p_role));

  RETURN v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_id_by_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_dashboard_user(text, text, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_id_by_email(text) FROM anon;
REVOKE ALL ON FUNCTION public.create_dashboard_user(text, text, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_dashboard_user(text, text, public.app_role) TO authenticated;
