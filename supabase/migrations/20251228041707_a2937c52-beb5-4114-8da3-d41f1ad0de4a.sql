-- Create product_images table for gallery
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view product images
CREATE POLICY "Anyone can view product images"
ON public.product_images
FOR SELECT
USING (true);

-- Sellers can manage their product images
CREATE POLICY "Sellers can insert product images"
ON public.product_images
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND seller_id = auth.uid()
  )
);

CREATE POLICY "Sellers can delete product images"
ON public.product_images
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND seller_id = auth.uid()
  )
);

-- Admins can manage all product images
CREATE POLICY "Admins can manage product images"
ON public.product_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));