-- First, drop the problematic RLS policy that causes infinite recursion
DROP POLICY IF EXISTS "Sellers can view orders with their products" ON public.orders;

-- Create a security definer function to check if a user is a seller with products in an order
CREATE OR REPLACE FUNCTION public.is_seller_of_order(order_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM order_items
    WHERE order_id = order_uuid AND seller_id = auth.uid()
  )
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_seller_of_order(uuid) TO authenticated;

-- Recreate the policy using the security definer function
CREATE POLICY "Sellers can view orders with their products" 
ON public.orders 
FOR SELECT 
USING (public.is_seller_of_order(id));