// ============================================================
// MIGRATION REFERENCE: Quick-Replace Patterns
// Apply these patterns to convert any remaining Supabase files
// ============================================================

// ============ PRODUCTS PAGE EXAMPLE ============
// File: src/pages/Products.tsx
//
// BEFORE:
//   import { supabase } from '@/integrations/supabase/client';
//   const { data } = await supabase.from('products').select('*').eq('is_approved', true);
//   const { data: sellerInfo } = await supabase.rpc('get_seller_public_info', { seller_user_id: sellerId });
//   const channel = supabase.channel('products-realtime').on(...).subscribe();
//   supabase.removeChannel(channel);
//
// AFTER:
//   import { productsApi, ProductDto } from '@/services/api';
//   const result = await productsApi.getAll();
//   const products = result.data; // Already includes sellerName, averageRating, etc.
//   // Remove realtime subscriptions (use polling or SignalR)
//
// The .NET API returns ProductDto which already includes:
//   - sellerName (no need for separate RPC call)
//   - averageRating, reviewCount (no need for separate reviews query)
//   - images array (no need for separate product_images query)

// ============ CHECKOUT EXAMPLE ============
// File: src/pages/Checkout.tsx
//
// BEFORE:
//   const { data: orderData } = await supabase.from('orders').insert({...}).select().single();
//   await supabase.from('order_items').insert(orderItems);
//   await supabase.from('products').update({ stock: ... }).eq('id', id);
//   await supabase.functions.invoke('create-order-notifications', { body: {...} });
//
// AFTER:
//   import { ordersApi, CreateOrderDto } from '@/services/api';
//   const order = await ordersApi.create({
//     total: finalTotal,
//     paymentMethod: 'cod',
//     shippingAddress: validatedShippingInfo,
//     items: items.map(item => ({
//       productId: item.product.id,
//       sellerId: item.product.sellerId,
//       productName: item.product.name,
//       quantity: item.quantity,
//       price: item.product.price,
//     })),
//   });
//   // Stock update and notifications are handled server-side automatically

// ============ SELLER DASHBOARD EXAMPLE ============
// File: src/pages/SellerDashboard.tsx
//
// BEFORE:
//   const { data } = await supabase.from('products').select('*').eq('seller_id', user.id);
//   const { data } = await supabase.from('order_items').select('*').eq('seller_id', user.id);
//   await supabase.storage.from('product-images').upload(fileName, file);
//   const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
//   await supabase.from('products').insert(productData).select().single();
//   await supabase.auth.updateUser({ password: newPassword });
//
// AFTER:
//   import { productsApi, ordersApi, uploadApi, authApi } from '@/services/api';
//   const products = await productsApi.getMyProducts();
//   const orders = await ordersApi.getSellerOrders();
//   const { url } = await uploadApi.productImage(file);
//   const product = await productsApi.create(productData);
//   await authApi.changePassword({ currentPassword: '', newPassword });

// ============ ADMIN DASHBOARD EXAMPLE ============
// File: src/pages/AdminDashboard.tsx
//
// BEFORE:
//   const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
//   const { data } = await supabase.from('orders').select('*');
//   const { data: rolesData } = await supabase.from('user_roles').select('*');
//   const { data: profilesData } = await supabase.from('profiles').select('user_id, full_name, phone');
//   await supabase.from('products').update({ is_approved: true }).eq('id', id);
//
// AFTER:
//   import { productsApi, ordersApi, usersApi } from '@/services/api';
//   const products = await productsApi.getAll(); // No need for pending filter, API handles it
//   const pendingProducts = await productsApi.getPending();
//   const orders = await ordersApi.getAll();
//   const users = await usersApi.getAllUsers(); // Returns AdminUserDto with role + profile combined
//   await productsApi.approve(id);

// ============ MANAGE USERS EXAMPLE ============
// File: src/pages/admin/ManageUsers.tsx
//
// BEFORE:
//   await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-seller`, {...});
//   await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user-password`, {...});
//   await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {...});
//   await supabase.storage.from('shop-images').upload(fileName, shopImage);
//
// AFTER:
//   import { usersApi, uploadApi } from '@/services/api';
//   await usersApi.createSeller({ email, password, fullName, phone, freeDelivery });
//   await usersApi.updateUserPassword(userId, newPassword);
//   await usersApi.deleteUser(userId);
//   const { url } = await uploadApi.shopImage(shopImage);

// ============ FORUM EXAMPLE ============
// File: src/pages/FarmerForum.tsx
//
// BEFORE:
//   const { data } = await supabase.from('forum_posts').select('*');
//   await supabase.from('forum_posts').insert({ user_id: user.id, title, content, category });
//   await supabase.from('forum_likes').insert({ user_id: user.id, post_id: postId });
//
// AFTER:
//   import { forumApi } from '@/services/api';
//   const posts = await forumApi.getPosts(category);
//   await forumApi.createPost({ title, content, category });
//   await forumApi.togglePostLike(postId); // Toggle handles add/remove

// ============ NOTIFICATIONS EXAMPLE ============
// File: src/components/notifications/NotificationBell.tsx
//
// BEFORE:
//   const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id);
//   await supabase.from('notifications').update({ is_read: true }).eq('id', id);
//   const channel = supabase.channel('notifications-channel').on(...).subscribe();
//
// AFTER:
//   import { notificationsApi } from '@/services/api';
//   const notifications = await notificationsApi.getAll();
//   await notificationsApi.markAsRead(id);
//   // For realtime: poll every 30 seconds or add SignalR

// ============ REVIEWS EXAMPLE ============
// File: src/components/product/ProductReviews.tsx
//
// BEFORE:
//   const { data } = await supabase.from('reviews').select('*').eq('product_id', productId);
//   await supabase.rpc('get_public_profile_name', { profile_user_id: userId });
//   await supabase.from('reviews').insert({ user_id, product_id, rating, comment });
//
// AFTER:
//   import { reviewsApi } from '@/services/api';
//   const reviews = await reviewsApi.getProductReviews(productId);
//   // userName is already included in ReviewDto
//   await reviewsApi.create({ productId, rating, comment });

// ============ PRODUCT TYPE MAPPING ============
// The frontend Product type maps from ProductDto:
//
// function mapProductDto(dto: ProductDto): Product {
//   return {
//     id: dto.id,
//     name: dto.name,
//     nameHi: dto.nameHi || dto.name,
//     nameMr: dto.nameHi || dto.name,
//     description: dto.description || '',
//     price: dto.price,
//     originalPrice: dto.originalPrice || undefined,
//     image: dto.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
//     category: dto.category,
//     stock: dto.stock,
//     unit: dto.unit,
//     sellerId: dto.sellerId,
//     sellerName: dto.sellerName || 'Unknown Seller',
//     rating: dto.averageRating,
//     reviews: dto.reviewCount,
//     isOrganic: dto.isOrganic,
//     isFeatured: false,
//     freeDelivery: false, // Get from seller info if needed
//   };
// }

export {};
