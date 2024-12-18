-- First, create the user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  uuid_generate_v4(),
  '00000000-0000-0000-0000-000000000000',
  'info@index.cy',
  crypt('123123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) RETURNING id;

-- Then, use the returned id to create the corresponding user record
INSERT INTO public.users (
  id,
  email,
  church_name,
  is_admin
)
SELECT 
  id,
  'info@index.cy',
  'Demo Church',
  true
FROM auth.users 
WHERE email = 'info@index.cy';