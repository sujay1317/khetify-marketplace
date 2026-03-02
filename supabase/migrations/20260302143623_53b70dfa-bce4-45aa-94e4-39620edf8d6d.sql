-- Fix ALL RLS policies: change from RESTRICTIVE to PERMISSIVE
-- The current RESTRICTIVE policies block all data access since there are no PERMISSIVE policies

-- ============ PROFILES ============
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- ============ USER_ROLES ============
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can view seller roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view seller roles" ON public.user_roles FOR SELECT USING (role = 'seller'::app_role);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ PRODUCTS ============
DROP POLICY IF EXISTS "Anyone can view approved products" ON public.products;
DROP POLICY IF EXISTS "Sellers can view own products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Sellers can insert own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;

CREATE POLICY "Anyone can view approved products" ON public.products FOR SELECT USING (is_approved = true);
CREATE POLICY "Sellers can view own products" ON public.products FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Sellers can insert own products" ON public.products FOR INSERT WITH CHECK ((auth.uid() = seller_id) AND has_role(auth.uid(), 'seller'::app_role));
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING ((auth.uid() = seller_id) AND has_role(auth.uid(), 'seller'::app_role));
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE USING ((auth.uid() = seller_id) AND has_role(auth.uid(), 'seller'::app_role));

-- ============ ORDERS ============
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders with their products" ON public.orders;

CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Sellers can view orders with their products" ON public.orders FOR SELECT USING (is_seller_of_order(id));

-- ============ ORDER_ITEMS ============
DROP POLICY IF EXISTS "Customers can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Sellers can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Customers can insert order items" ON public.order_items;

CREATE POLICY "Customers can view own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));
CREATE POLICY "Sellers can view their order items" ON public.order_items FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Customers can insert order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));

-- ============ ORDER_TRACKING ============
DROP POLICY IF EXISTS "Customers can view own order tracking" ON public.order_tracking;
DROP POLICY IF EXISTS "Sellers can view order tracking" ON public.order_tracking;
DROP POLICY IF EXISTS "Admins can manage order tracking" ON public.order_tracking;
DROP POLICY IF EXISTS "Sellers can insert order tracking" ON public.order_tracking;
DROP POLICY IF EXISTS "Sellers can update order tracking" ON public.order_tracking;

CREATE POLICY "Customers can view own order tracking" ON public.order_tracking FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_tracking.order_id AND orders.customer_id = auth.uid()));
CREATE POLICY "Sellers can view order tracking" ON public.order_tracking FOR SELECT USING (EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = order_tracking.order_id AND oi.seller_id = auth.uid()));
CREATE POLICY "Admins can manage order tracking" ON public.order_tracking FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Sellers can insert order tracking" ON public.order_tracking FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = order_tracking.order_id AND oi.seller_id = auth.uid()));
CREATE POLICY "Sellers can update order tracking" ON public.order_tracking FOR UPDATE USING (EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = order_tracking.order_id AND oi.seller_id = auth.uid()));

-- ============ NOTIFICATIONS ============
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- ============ WISHLISTS ============
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can add to wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can remove from wishlist" ON public.wishlists;

CREATE POLICY "Users can view own wishlist" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to wishlist" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from wishlist" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- ============ REVIEWS ============
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- ============ COUPONS ============
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;

CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ PRODUCT_IMAGES ============
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
DROP POLICY IF EXISTS "Sellers can insert product images" ON public.product_images;
DROP POLICY IF EXISTS "Sellers can delete product images" ON public.product_images;

CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Sellers can insert product images" ON public.product_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.seller_id = auth.uid()));
CREATE POLICY "Sellers can delete product images" ON public.product_images FOR DELETE USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.seller_id = auth.uid()));

-- ============ FORUM_POSTS ============
DROP POLICY IF EXISTS "Anyone can view forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.forum_posts;

CREATE POLICY "Anyone can view forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.forum_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all posts" ON public.forum_posts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ FORUM_COMMENTS ============
DROP POLICY IF EXISTS "Anyone can view comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.forum_comments;

CREATE POLICY "Anyone can view comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.forum_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.forum_comments FOR DELETE USING (auth.uid() = user_id);

-- ============ FORUM_LIKES ============
DROP POLICY IF EXISTS "Anyone can view likes" ON public.forum_likes;
DROP POLICY IF EXISTS "Authenticated users can like" ON public.forum_likes;
DROP POLICY IF EXISTS "Users can remove own likes" ON public.forum_likes;

CREATE POLICY "Anyone can view likes" ON public.forum_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.forum_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON public.forum_likes FOR DELETE USING (auth.uid() = user_id);