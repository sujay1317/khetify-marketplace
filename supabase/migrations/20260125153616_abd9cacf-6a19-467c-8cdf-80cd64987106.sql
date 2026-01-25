-- Create a function to get public profile info (just name) for any user
-- This is safe to expose as it only returns the display name
CREATE OR REPLACE FUNCTION public.get_public_profile_name(profile_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT full_name FROM profiles WHERE user_id = profile_user_id LIMIT 1
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile_name(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile_name(uuid) TO anon;