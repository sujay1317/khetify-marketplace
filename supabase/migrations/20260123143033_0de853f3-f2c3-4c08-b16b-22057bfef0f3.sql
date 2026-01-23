-- Fix Critical: Protect customer personal data (phone, full name)
-- Create secure view for public seller info only

-- Create a function to safely get seller public info without exposing personal data
CREATE OR REPLACE FUNCTION public.get_seller_public_info(seller_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  shop_image TEXT,
  free_delivery BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    p.shop_image,
    p.free_delivery
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.user_id
  WHERE p.user_id = seller_user_id 
    AND ur.role = 'seller';
$$;

-- Grant execute to authenticated and anon users for product pages
GRANT EXECUTE ON FUNCTION public.get_seller_public_info(UUID) TO authenticated, anon;

-- Fix: Allow sellers to view orders containing their products
CREATE POLICY "Sellers can view orders with their products"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM order_items oi
    WHERE oi.order_id = orders.id
      AND oi.seller_id = auth.uid()
  )
);

-- Fix: Allow sellers to view order tracking for their orders
CREATE POLICY "Sellers can view order tracking"
ON public.order_tracking
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM order_items oi
    WHERE oi.order_id = order_tracking.order_id
      AND oi.seller_id = auth.uid()
  )
);

-- Fix: Allow sellers to insert order tracking for their orders
CREATE POLICY "Sellers can insert order tracking"
ON public.order_tracking
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM order_items oi
    WHERE oi.order_id = order_tracking.order_id
      AND oi.seller_id = auth.uid()
  )
);

-- Fix: Allow sellers to update order tracking for their orders
CREATE POLICY "Sellers can update order tracking"
ON public.order_tracking
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM order_items oi
    WHERE oi.order_id = order_tracking.order_id
      AND oi.seller_id = auth.uid()
  )
);

-- Fix: Allow users to delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);