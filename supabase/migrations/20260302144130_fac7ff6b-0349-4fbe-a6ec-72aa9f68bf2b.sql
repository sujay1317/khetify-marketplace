-- Allow authenticated users to self-provision their initial role (non-admin only)
-- Needed because many existing auth users are missing user_roles rows.

DROP POLICY IF EXISTS "Users can insert own non-admin role" ON public.user_roles;

CREATE POLICY "Users can insert own non-admin role"
ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('customer'::app_role, 'seller'::app_role)
);