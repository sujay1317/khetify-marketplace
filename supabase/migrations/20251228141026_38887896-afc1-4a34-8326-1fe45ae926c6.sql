-- Allow anyone to view profiles of sellers (for store pages and product cards)
CREATE POLICY "Anyone can view seller profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = profiles.user_id
    AND user_roles.role = 'seller'
  )
);