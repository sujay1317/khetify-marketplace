-- Allow anyone to view which users are sellers (for displaying seller list)
CREATE POLICY "Anyone can view seller roles"
ON public.user_roles
FOR SELECT
USING (role = 'seller');