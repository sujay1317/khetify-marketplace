-- Enable realtime for products table
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- Ensure products has REPLICA IDENTITY for full row data
ALTER TABLE public.products REPLICA IDENTITY FULL;