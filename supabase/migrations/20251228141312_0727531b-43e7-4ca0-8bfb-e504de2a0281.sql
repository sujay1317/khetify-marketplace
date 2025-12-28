-- Drop the restrictive policy
DROP POLICY IF EXISTS "Anyone can view seller profiles" ON public.profiles;

-- Recreate as PERMISSIVE policy so it works alongside other SELECT policies
CREATE POLICY "Anyone can view seller profiles"
ON public.profiles
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = profiles.user_id
    AND user_roles.role = 'seller'
  )
);