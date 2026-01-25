-- ============================================================
-- KHETIFY COMPLETE BACKEND BACKUP
-- Generated: 2025-01-25
-- ============================================================
-- This file contains the complete database schema, RLS policies,
-- functions, triggers, storage configuration, and Edge Functions
-- ============================================================

-- ============================================================
-- PART 1: ENUMS
-- ============================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'seller', 'customer');

-- ============================================================
-- PART 2: TABLES
-- ============================================================

-- Profiles table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    full_name text,
    phone text,
    avatar_url text,
    shop_image text,
    free_delivery boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    role app_role NOT NULL DEFAULT 'customer'::app_role,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id uuid NOT NULL,
    name text NOT NULL,
    name_hi text,
    description text,
    description_hi text,
    price numeric NOT NULL,
    original_price numeric,
    category text NOT NULL,
    unit text DEFAULT 'kg'::text,
    stock integer DEFAULT 0,
    image text,
    is_organic boolean DEFAULT false,
    is_approved boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Product images table
CREATE TABLE public.product_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL,
    total numeric NOT NULL,
    status text DEFAULT 'pending'::text,
    payment_method text DEFAULT 'cod'::text,
    shipping_address jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    seller_id uuid,
    product_name text NOT NULL,
    quantity integer NOT NULL,
    price numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Order tracking table
CREATE TABLE public.order_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status text NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Coupons table
CREATE TABLE public.coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    discount_type text NOT NULL DEFAULT 'percentage'::text,
    discount_value numeric NOT NULL,
    min_order_amount numeric DEFAULT 0,
    max_uses integer,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Forum posts table
CREATE TABLE public.forum_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL DEFAULT 'general'::text,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    is_pinned boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Forum comments table
CREATE TABLE public.forum_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    content text NOT NULL,
    likes_count integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Forum likes table
CREATE TABLE public.forum_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    comment_id uuid REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT forum_likes_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Wishlists table
CREATE TABLE public.wishlists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- Reviews table
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL DEFAULT 'info'::text,
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- PART 3: INDEXES
-- ============================================================

CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_is_approved ON public.products(is_approved);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_seller_id ON public.order_items(seller_id);
CREATE INDEX idx_order_tracking_order_id ON public.order_tracking(order_id);
CREATE INDEX idx_forum_posts_user_id ON public.forum_posts(user_id);
CREATE INDEX idx_forum_comments_post_id ON public.forum_comments(post_id);
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- ============================================================
-- PART 4: DATABASE FUNCTIONS
-- ============================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Get seller public info (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_seller_public_info(seller_user_id uuid)
RETURNS TABLE(user_id uuid, full_name text, shop_image text, free_delivery boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'customer'
  );
  
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;

-- Update post comments count
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Update likes count
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE public.forum_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE public.forum_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE public.forum_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE public.forum_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- ============================================================
-- PART 5: TRIGGERS
-- ============================================================

-- Auth trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_forum_comments_updated_at
  BEFORE UPDATE ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Forum counters
CREATE TRIGGER on_forum_comment_change
  AFTER INSERT OR DELETE ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

CREATE TRIGGER on_forum_like_change
  AFTER INSERT OR DELETE ON public.forum_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

-- ============================================================
-- PART 6: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 7: RLS POLICIES - PROFILES
-- ============================================================

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- PART 8: RLS POLICIES - USER ROLES
-- ============================================================

CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view seller roles" ON public.user_roles
  FOR SELECT USING (role = 'seller'::app_role);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PART 9: RLS POLICIES - PRODUCTS
-- ============================================================

CREATE POLICY "Anyone can view approved products" ON public.products
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Sellers can view own products" ON public.products
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = seller_id AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Sellers can update own products" ON public.products
  FOR UPDATE USING (auth.uid() = seller_id AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Sellers can delete own products" ON public.products
  FOR DELETE USING (auth.uid() = seller_id AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PART 10: RLS POLICIES - PRODUCT IMAGES
-- ============================================================

CREATE POLICY "Anyone can view product images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Sellers can insert product images" ON public.product_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.seller_id = auth.uid())
  );

CREATE POLICY "Sellers can delete product images" ON public.product_images
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.seller_id = auth.uid())
  );

CREATE POLICY "Admins can manage product images" ON public.product_images
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PART 11: RLS POLICIES - ORDERS
-- ============================================================

CREATE POLICY "Customers can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Sellers can view orders with their products" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = orders.id AND oi.seller_id = auth.uid())
  );

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PART 12: RLS POLICIES - ORDER ITEMS
-- ============================================================

CREATE POLICY "Customers can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );

CREATE POLICY "Customers can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );

CREATE POLICY "Sellers can view their order items" ON public.order_items
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PART 13: RLS POLICIES - ORDER TRACKING
-- ============================================================

CREATE POLICY "Customers can view own order tracking" ON public.order_tracking
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_tracking.order_id AND orders.customer_id = auth.uid())
  );

CREATE POLICY "Sellers can view order tracking" ON public.order_tracking
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = order_tracking.order_id AND oi.seller_id = auth.uid())
  );

CREATE POLICY "Sellers can insert order tracking" ON public.order_tracking
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = order_tracking.order_id AND oi.seller_id = auth.uid())
  );

CREATE POLICY "Sellers can update order tracking" ON public.order_tracking
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = order_tracking.order_id AND oi.seller_id = auth.uid())
  );

CREATE POLICY "Admins can manage order tracking" ON public.order_tracking
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PART 14: RLS POLICIES - COUPONS
-- ============================================================

CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PART 15: RLS POLICIES - FORUM POSTS
-- ============================================================

CREATE POLICY "Anyone can view forum posts" ON public.forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.forum_posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts" ON public.forum_posts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PART 16: RLS POLICIES - FORUM COMMENTS
-- ============================================================

CREATE POLICY "Anyone can view comments" ON public.forum_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.forum_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.forum_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.forum_comments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PART 17: RLS POLICIES - FORUM LIKES
-- ============================================================

CREATE POLICY "Anyone can view likes" ON public.forum_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON public.forum_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes" ON public.forum_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PART 18: RLS POLICIES - WISHLISTS
-- ============================================================

CREATE POLICY "Users can view own wishlist" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist" ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PART 19: RLS POLICIES - REVIEWS
-- ============================================================

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PART 20: RLS POLICIES - NOTIFICATIONS
-- ============================================================

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- PART 21: STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-images', 'shop-images', true);

-- ============================================================
-- PART 22: STORAGE POLICIES - PRODUCT IMAGES
-- ============================================================

CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- PART 23: STORAGE POLICIES - SHOP IMAGES
-- ============================================================

CREATE POLICY "Public can view shop images" ON storage.objects
  FOR SELECT USING (bucket_id = 'shop-images');

CREATE POLICY "Sellers can upload shop images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'shop-images' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own shop images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'shop-images' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own shop images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'shop-images' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can manage all shop images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'shop-images' AND 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- ============================================================
-- PART 24: REALTIME (if needed)
-- ============================================================

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================
-- END OF DATABASE SCHEMA
-- ============================================================
