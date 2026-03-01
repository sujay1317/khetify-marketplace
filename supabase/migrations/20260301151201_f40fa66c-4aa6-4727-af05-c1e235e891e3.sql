
-- Fix products SELECT policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view approved products" ON public.products;
DROP POLICY IF EXISTS "Sellers can view own products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Sellers can insert own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Anyone can view approved products"
  ON public.products FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Sellers can view own products"
  ON public.products FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Sellers can insert own products"
  ON public.products FOR INSERT
  WITH CHECK ((auth.uid() = seller_id) AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Sellers can update own products"
  ON public.products FOR UPDATE
  USING ((auth.uid() = seller_id) AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Sellers can delete own products"
  ON public.products FOR DELETE
  USING ((auth.uid() = seller_id) AND has_role(auth.uid(), 'seller'::app_role));
