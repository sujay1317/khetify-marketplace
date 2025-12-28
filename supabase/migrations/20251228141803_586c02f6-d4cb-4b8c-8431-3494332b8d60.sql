-- Fix seller profile visibility by using security-definer role check (bypasses RLS on user_roles)
DROP POLICY IF EXISTS "Anyone can view seller profiles" ON public.profiles;

CREATE POLICY "Anyone can view seller profiles"
ON public.profiles
FOR SELECT
TO public
USING (public.has_role(profiles.user_id, 'seller'::app_role));
