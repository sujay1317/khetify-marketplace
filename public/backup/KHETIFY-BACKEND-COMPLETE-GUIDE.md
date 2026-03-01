# 🌾 Khetify - Complete Backend Setup Guide

> **Agricultural Marketplace** | Complete end-to-end backend documentation
> Last Updated: 2026-03-01

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Database Schema](#3-database-schema)
4. [Table Relationships & ER Diagram](#4-table-relationships--er-diagram)
5. [Indexes](#5-indexes)
6. [Database Functions](#6-database-functions)
7. [Triggers](#7-triggers)
8. [Row Level Security (RLS) Policies](#8-row-level-security-rls-policies)
9. [Storage Buckets](#9-storage-buckets)
10. [Edge Functions](#10-edge-functions)
11. [Authentication Flow](#11-authentication-flow)
12. [Realtime](#12-realtime)
13. [Required Secrets](#13-required-secrets)
14. [Known Issues & Fixes](#14-known-issues--fixes)
15. [Restoration Instructions](#15-restoration-instructions)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│              Vite + TypeScript + Tailwind            │
├─────────────────────────────────────────────────────┤
│               Supabase JS Client SDK                │
├──────────┬──────────┬───────────┬───────────────────┤
│   Auth   │ Database │  Storage  │  Edge Functions   │
│ (JWT)    │ (Postgres│ (Buckets) │  (Deno Runtime)   │
│          │  + RLS)  │           │                   │
└──────────┴──────────┴───────────┴───────────────────┘
```

### User Roles
| Role       | Description                                      |
|------------|--------------------------------------------------|
| `admin`    | Full access: manage users, products, orders, coupons |
| `seller`   | Manage own shop, products, view orders for their items |
| `customer` | Browse, purchase, review, wishlist, forum         |

---

## 2. Prerequisites

- Supabase project (or Lovable Cloud)
- Required environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PROJECT_ID`

---

## 3. Database Schema

### 3.1 Enum Types

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'seller', 'customer');
```

### 3.2 Tables (14 Total)

---

#### `profiles`
> Stores user profile data. Auto-created on signup via trigger.

| Column         | Type                     | Nullable | Default           | Notes                    |
|----------------|--------------------------|----------|-------------------|--------------------------|
| `id`           | uuid (PK)                | No       | gen_random_uuid() |                          |
| `user_id`      | uuid (UNIQUE)            | No       | —                 | Links to auth.users(id)  |
| `full_name`    | text                     | Yes      | —                 |                          |
| `phone`        | text                     | Yes      | —                 |                          |
| `avatar_url`   | text                     | Yes      | —                 |                          |
| `shop_image`   | text                     | Yes      | —                 | Seller shop banner       |
| `free_delivery`| boolean                  | Yes      | false             | Seller delivery setting  |
| `created_at`   | timestamptz              | No       | now()             |                          |
| `updated_at`   | timestamptz              | No       | now()             | Auto-updated via trigger |

---

#### `user_roles`
> Stores user role assignments. Separated from profiles for security (prevents privilege escalation).

| Column      | Type                     | Nullable | Default           | Notes                    |
|-------------|--------------------------|----------|-------------------|--------------------------|
| `id`        | uuid (PK)                | No       | gen_random_uuid() |                          |
| `user_id`   | uuid (UNIQUE)            | No       | —                 | Links to auth.users(id)  |
| `role`      | app_role                 | No       | 'customer'        |                          |
| `created_at`| timestamptz              | No       | now()             |                          |

---

#### `products`
> Product listings managed by sellers, approved by admin.

| Column          | Type        | Nullable | Default           | Notes                     |
|-----------------|-------------|----------|-------------------|---------------------------|
| `id`            | uuid (PK)   | No       | gen_random_uuid() |                           |
| `seller_id`     | uuid        | No       | —                 | The seller's auth user_id |
| `name`          | text        | No       | —                 | English name              |
| `name_hi`       | text        | Yes      | —                 | Hindi name                |
| `description`   | text        | Yes      | —                 | English description       |
| `description_hi`| text        | Yes      | —                 | Hindi description         |
| `price`         | numeric     | No       | —                 | Current selling price     |
| `original_price`| numeric     | Yes      | —                 | MRP / strikethrough price |
| `category`      | text        | No       | —                 | Product category          |
| `unit`          | text        | Yes      | 'kg'              | Unit of measurement       |
| `stock`         | integer     | Yes      | 0                 | Available inventory       |
| `image`         | text        | Yes      | —                 | Primary image URL         |
| `is_organic`    | boolean     | Yes      | false             | Organic certification     |
| `is_approved`   | boolean     | Yes      | false             | Admin approval status     |
| `created_at`    | timestamptz | No       | now()             |                           |
| `updated_at`    | timestamptz | No       | now()             | Auto-updated via trigger  |

---

#### `product_images`
> Additional product images (multi-image gallery).

| Column         | Type        | Nullable | Default           | FK Reference              |
|----------------|-------------|----------|-------------------|---------------------------|
| `id`           | uuid (PK)   | No       | gen_random_uuid() |                           |
| `product_id`   | uuid        | No       | —                 | → products(id) CASCADE    |
| `image_url`    | text        | No       | —                 |                           |
| `display_order`| integer     | Yes      | 0                 | Sort order                |
| `created_at`   | timestamptz | No       | now()             |                           |

---

#### `orders`
> Customer purchase orders.

| Column            | Type        | Nullable | Default    | Notes                    |
|-------------------|-------------|----------|------------|--------------------------|
| `id`              | uuid (PK)   | No       | gen_random_uuid() |                   |
| `customer_id`     | uuid        | No       | —          | Buyer's auth user_id     |
| `total`           | numeric     | No       | —          | Order total amount       |
| `status`          | text        | Yes      | 'pending'  | pending/confirmed/shipped/delivered/cancelled |
| `payment_method`  | text        | Yes      | 'cod'      | cod / online             |
| `shipping_address`| jsonb       | Yes      | —          | {name, phone, address, city, state, pincode} |
| `created_at`      | timestamptz | No       | now()      |                          |
| `updated_at`      | timestamptz | No       | now()      | Auto-updated via trigger |

---

#### `order_items`
> Individual line items within an order.

| Column        | Type        | Nullable | Default           | FK Reference                |
|---------------|-------------|----------|-------------------|-----------------------------|
| `id`          | uuid (PK)   | No       | gen_random_uuid() |                             |
| `order_id`    | uuid        | No       | —                 | → orders(id) CASCADE        |
| `product_id`  | uuid        | Yes      | —                 | → products(id) SET NULL     |
| `seller_id`   | uuid        | Yes      | —                 | Seller's auth user_id       |
| `product_name`| text        | No       | —                 | Snapshot at time of purchase|
| `quantity`    | integer     | No       | —                 |                             |
| `price`       | numeric     | No       | —                 | Price at time of purchase   |
| `created_at`  | timestamptz | No       | now()             |                             |

---

#### `order_tracking`
> Status history for orders.

| Column       | Type        | Nullable | Default           | FK Reference           |
|--------------|-------------|----------|-------------------|------------------------|
| `id`         | uuid (PK)   | No       | gen_random_uuid() |                        |
| `order_id`   | uuid        | No       | —                 | → orders(id) CASCADE   |
| `status`     | text        | No       | —                 | Tracking status        |
| `description`| text        | Yes      | —                 | Optional details       |
| `created_at` | timestamptz | No       | now()             |                        |

---

#### `coupons`
> Discount coupon codes managed by admin.

| Column           | Type        | Nullable | Default        | Notes                    |
|------------------|-------------|----------|----------------|--------------------------|
| `id`             | uuid (PK)   | No       | gen_random_uuid() |                       |
| `code`           | text (UNIQUE)| No      | —              | Coupon code              |
| `discount_type`  | text        | No       | 'percentage'   | percentage / fixed       |
| `discount_value` | numeric     | No       | —              | Amount or percentage     |
| `min_order_amount`| numeric    | Yes      | 0              | Minimum order to apply   |
| `max_uses`       | integer     | Yes      | —              | Usage limit              |
| `used_count`     | integer     | Yes      | 0              | Current usage count      |
| `is_active`      | boolean     | Yes      | true           |                          |
| `valid_from`     | timestamptz | Yes      | now()          |                          |
| `valid_until`    | timestamptz | Yes      | —              |                          |
| `created_at`     | timestamptz | No       | now()          |                          |
| `updated_at`     | timestamptz | No       | now()          |                          |

---

#### `forum_posts`
> Community forum posts (Farmer Forum).

| Column          | Type        | Nullable | Default           | FK Reference                 |
|-----------------|-------------|----------|-------------------|------------------------------|
| `id`            | uuid (PK)   | No       | gen_random_uuid() |                              |
| `user_id`       | uuid        | No       | —                 | → profiles(user_id) CASCADE  |
| `title`         | text        | No       | —                 |                              |
| `content`       | text        | No       | —                 |                              |
| `category`      | text        | No       | 'general'         | general/crop-tips/market/weather/organic |
| `likes_count`   | integer     | Yes      | 0                 | Auto-updated via trigger     |
| `comments_count`| integer     | Yes      | 0                 | Auto-updated via trigger     |
| `is_pinned`     | boolean     | Yes      | false             | Admin can pin               |
| `created_at`    | timestamptz | No       | now()             |                              |
| `updated_at`    | timestamptz | No       | now()             |                              |

---

#### `forum_comments`
> Comments on forum posts.

| Column       | Type        | Nullable | Default           | FK Reference                 |
|--------------|-------------|----------|-------------------|------------------------------|
| `id`         | uuid (PK)   | No       | gen_random_uuid() |                              |
| `post_id`    | uuid        | No       | —                 | → forum_posts(id) CASCADE    |
| `user_id`    | uuid        | No       | —                 | → profiles(user_id) CASCADE  |
| `content`    | text        | No       | —                 |                              |
| `likes_count`| integer     | Yes      | 0                 | Auto-updated via trigger     |
| `created_at` | timestamptz | No       | now()             |                              |
| `updated_at` | timestamptz | No       | now()             |                              |

---

#### `forum_likes`
> Tracks likes on posts and comments (one per user per target).

| Column       | Type        | Nullable | Default           | FK Reference                    |
|--------------|-------------|----------|-------------------|---------------------------------|
| `id`         | uuid (PK)   | No       | gen_random_uuid() |                                 |
| `user_id`    | uuid        | No       | —                 | → profiles(user_id) CASCADE     |
| `post_id`    | uuid        | Yes      | —                 | → forum_posts(id) CASCADE       |
| `comment_id` | uuid        | Yes      | —                 | → forum_comments(id) CASCADE    |
| `created_at` | timestamptz | No       | now()             |                                 |

**Constraint:** `forum_likes_target_check` — exactly one of `post_id` or `comment_id` must be non-null.

---

#### `wishlists`
> User product wishlists.

| Column      | Type        | Nullable | Default           | FK Reference              |
|-------------|-------------|----------|-------------------|---------------------------|
| `id`        | uuid (PK)   | No       | gen_random_uuid() |                           |
| `user_id`   | uuid        | No       | —                 | Auth user_id              |
| `product_id`| uuid        | No       | —                 | → products(id) CASCADE    |
| `created_at`| timestamptz | No       | now()             |                           |

**Constraint:** UNIQUE(user_id, product_id)

---

#### `reviews`
> Product reviews with ratings.

| Column      | Type        | Nullable | Default           | FK Reference              |
|-------------|-------------|----------|-------------------|---------------------------|
| `id`        | uuid (PK)   | No       | gen_random_uuid() |                           |
| `user_id`   | uuid        | No       | —                 | Auth user_id              |
| `product_id`| uuid        | No       | —                 | → products(id) CASCADE    |
| `rating`    | integer     | No       | —                 | CHECK: 1–5                |
| `comment`   | text        | Yes      | —                 |                           |
| `created_at`| timestamptz | No       | now()             |                           |
| `updated_at`| timestamptz | No       | now()             |                           |

---

#### `notifications`
> In-app notifications for users.

| Column      | Type        | Nullable | Default           | FK Reference                |
|-------------|-------------|----------|-------------------|-----------------------------|
| `id`        | uuid (PK)   | No       | gen_random_uuid() |                             |
| `user_id`   | uuid        | No       | —                 | Auth user_id                |
| `title`     | text        | No       | —                 |                             |
| `message`   | text        | No       | —                 |                             |
| `type`      | text        | No       | 'info'            | info/order/alert            |
| `order_id`  | uuid        | Yes      | —                 | → orders(id) SET NULL       |
| `is_read`   | boolean     | Yes      | false             |                             |
| `created_at`| timestamptz | Yes      | now()             |                             |

---

## 4. Table Relationships & ER Diagram

```
auth.users (managed by Supabase)
    │
    ├──→ profiles (user_id)          1:1
    ├──→ user_roles (user_id)        1:1
    │
    ├──→ products (seller_id)        1:N  (seller creates products)
    │       ├──→ product_images      1:N  (product_id → products.id)
    │       ├──→ wishlists           N:M  (product_id → products.id)
    │       └──→ reviews             1:N  (product_id → products.id)
    │
    ├──→ orders (customer_id)        1:N  (customer places orders)
    │       ├──→ order_items         1:N  (order_id → orders.id)
    │       │       └── seller_id         (tracks which seller's item)
    │       │       └── product_id        (→ products.id, SET NULL)
    │       ├──→ order_tracking      1:N  (order_id → orders.id)
    │       └──→ notifications       1:N  (order_id → orders.id)
    │
    ├──→ forum_posts (user_id)       1:N
    │       ├──→ forum_comments      1:N  (post_id → forum_posts.id)
    │       └──→ forum_likes         1:N  (post_id → forum_posts.id)
    │
    └──→ forum_likes (user_id)       1:N
         └──→ forum_comments         1:N  (comment_id → forum_comments.id)

coupons (standalone, admin-managed)
```

### Foreign Key Cascade Behavior

| Parent Table     | Child Table      | On Delete    |
|------------------|------------------|--------------|
| products         | product_images   | CASCADE      |
| products         | wishlists        | CASCADE      |
| products         | reviews          | CASCADE      |
| orders           | order_items      | CASCADE      |
| orders           | order_tracking   | CASCADE      |
| orders           | notifications    | SET NULL      |
| products         | order_items      | SET NULL      |
| forum_posts      | forum_comments   | CASCADE      |
| forum_posts      | forum_likes      | CASCADE      |
| forum_comments   | forum_likes      | CASCADE      |
| profiles(user_id)| forum_posts      | CASCADE      |
| profiles(user_id)| forum_comments   | CASCADE      |
| profiles(user_id)| forum_likes      | CASCADE      |

---

## 5. Indexes

Performance indexes for frequently queried columns:

```sql
CREATE INDEX idx_products_seller_id     ON public.products(seller_id);
CREATE INDEX idx_products_category      ON public.products(category);
CREATE INDEX idx_products_is_approved   ON public.products(is_approved);
CREATE INDEX idx_order_items_order_id   ON public.order_items(order_id);
CREATE INDEX idx_order_items_seller_id  ON public.order_items(seller_id);
CREATE INDEX idx_order_tracking_order_id ON public.order_tracking(order_id);
CREATE INDEX idx_forum_posts_user_id    ON public.forum_posts(user_id);
CREATE INDEX idx_forum_comments_post_id ON public.forum_comments(post_id);
CREATE INDEX idx_wishlists_user_id      ON public.wishlists(user_id);
CREATE INDEX idx_reviews_product_id     ON public.reviews(product_id);
CREATE INDEX idx_notifications_user_id  ON public.notifications(user_id);
```

### Why These Indexes?

| Index                        | Purpose                                           |
|------------------------------|---------------------------------------------------|
| `idx_products_seller_id`     | Fast seller dashboard product listing             |
| `idx_products_category`      | Category filtering on product pages               |
| `idx_products_is_approved`   | Quickly filter approved products for public view  |
| `idx_order_items_order_id`   | Join order_items when viewing order details        |
| `idx_order_items_seller_id`  | Seller order lookup via RLS policy                |
| `idx_order_tracking_order_id`| Order status timeline queries                     |
| `idx_forum_posts_user_id`    | User's own posts lookup                           |
| `idx_forum_comments_post_id` | Loading comments for a post                       |
| `idx_wishlists_user_id`      | User wishlist page                                |
| `idx_reviews_product_id`     | Product detail page reviews                       |
| `idx_notifications_user_id`  | Notification bell queries                         |

---

## 6. Database Functions

### 6.1 `has_role(uuid, app_role) → boolean`
> **SECURITY DEFINER** — Checks if a user has a specific role. Used in RLS policies to avoid recursive lookups.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### 6.2 `get_user_role(uuid) → app_role`
> Returns the role for a given user. Used by frontend AuthContext.

```sql
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;
```

### 6.3 `get_seller_public_info(uuid) → TABLE`
> **SECURITY DEFINER** — Bypasses RLS on profiles to expose only non-sensitive seller data to customers.

```sql
CREATE OR REPLACE FUNCTION public.get_seller_public_info(seller_user_id uuid)
RETURNS TABLE(user_id uuid, full_name text, shop_image text, free_delivery boolean)
LANGUAGE sql SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.user_id, p.full_name, p.shop_image, p.free_delivery
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.user_id
  WHERE p.user_id = seller_user_id AND ur.role = 'seller';
$$;
```

### 6.4 `get_public_profile_name(uuid) → text`
> Returns just the full_name for displaying in reviews, forum posts, etc.

```sql
CREATE OR REPLACE FUNCTION public.get_public_profile_name(profile_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT full_name FROM profiles WHERE user_id = profile_user_id LIMIT 1
$$;
```

### 6.5 `is_seller_of_order(uuid) → boolean`
> Checks if the current user is a seller with items in the given order. Used in orders RLS.

```sql
CREATE OR REPLACE FUNCTION public.is_seller_of_order(order_uuid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM order_items
    WHERE order_id = order_uuid AND seller_id = auth.uid()
  )
$$;
```

### 6.6 `update_updated_at() → trigger`
> Generic trigger function to auto-set `updated_at = now()` on row update.

### 6.7 `handle_new_user() → trigger`
> Auto-creates profile + user_role when a new auth.users row is inserted (signup).

### 6.8 `update_post_comments_count() → trigger`
> Increments/decrements `forum_posts.comments_count` on comment insert/delete.

### 6.9 `update_likes_count() → trigger`
> Increments/decrements likes_count on posts or comments when likes are added/removed.

---

## 7. Triggers

| Trigger Name                    | Table              | Event              | Function                      |
|---------------------------------|--------------------|--------------------|-------------------------------|
| `on_auth_user_created`          | auth.users         | AFTER INSERT       | handle_new_user()             |
| `update_profiles_updated_at`    | profiles           | BEFORE UPDATE      | update_updated_at()           |
| `update_products_updated_at`    | products           | BEFORE UPDATE      | update_updated_at()           |
| `update_orders_updated_at`      | orders             | BEFORE UPDATE      | update_updated_at()           |
| `update_coupons_updated_at`     | coupons            | BEFORE UPDATE      | update_updated_at()           |
| `update_forum_posts_updated_at` | forum_posts        | BEFORE UPDATE      | update_updated_at()           |
| `update_forum_comments_updated_at` | forum_comments  | BEFORE UPDATE      | update_updated_at()           |
| `update_reviews_updated_at`     | reviews            | BEFORE UPDATE      | update_updated_at()           |
| `on_forum_comment_change`       | forum_comments     | AFTER INSERT/DELETE| update_post_comments_count()  |
| `on_forum_like_change`          | forum_likes        | AFTER INSERT/DELETE| update_likes_count()          |

---

## 8. Row Level Security (RLS) Policies

All 14 tables have RLS enabled. Below is the complete policy map.

### ⚠️ IMPORTANT: PERMISSIVE vs RESTRICTIVE

- **PERMISSIVE** (default): Multiple policies combine with `OR` logic — user needs to match ANY policy.
- **RESTRICTIVE**: Policies combine with `AND` logic — user must match ALL policies simultaneously.

**All product policies MUST be PERMISSIVE** (see [Issue Fix #1](#141-products-showing-only-one-product)).

---

### 8.1 profiles

| Policy                        | Command | Logic       | Expression                           |
|-------------------------------|---------|-------------|--------------------------------------|
| Users can view own profile    | SELECT  | RESTRICTIVE | `auth.uid() = user_id`               |
| Admins can view all profiles  | SELECT  | RESTRICTIVE | `has_role(auth.uid(), 'admin')`       |
| Users can insert own profile  | INSERT  | RESTRICTIVE | `auth.uid() = user_id`               |
| Users can update own profile  | UPDATE  | RESTRICTIVE | `auth.uid() = user_id`               |

### 8.2 user_roles

| Policy                        | Command | Expression                           |
|-------------------------------|---------|--------------------------------------|
| Users can view own role       | SELECT  | `auth.uid() = user_id`              |
| Anyone can view seller roles  | SELECT  | `role = 'seller'`                    |
| Admins can manage all roles   | ALL     | `has_role(auth.uid(), 'admin')`      |

### 8.3 products ✅ (Fixed — must be PERMISSIVE)

| Policy                              | Command | Expression                                                |
|--------------------------------------|---------|-----------------------------------------------------------|
| Anyone can view approved products    | SELECT  | `is_approved = true`                                      |
| Sellers can view own products        | SELECT  | `auth.uid() = seller_id`                                  |
| Sellers can insert own products      | INSERT  | `auth.uid() = seller_id AND has_role(uid, 'seller')`      |
| Sellers can update own products      | UPDATE  | `auth.uid() = seller_id AND has_role(uid, 'seller')`      |
| Sellers can delete own products      | DELETE  | `auth.uid() = seller_id AND has_role(uid, 'seller')`      |
| Admins can manage all products       | ALL     | `has_role(auth.uid(), 'admin')`                           |

### 8.4 product_images

| Policy                              | Command | Expression                                                |
|--------------------------------------|---------|-----------------------------------------------------------|
| Anyone can view product images       | SELECT  | `true`                                                    |
| Sellers can insert product images    | INSERT  | Owner check via products join                             |
| Sellers can delete product images    | DELETE  | Owner check via products join                             |
| Admins can manage product images     | ALL     | `has_role(auth.uid(), 'admin')`                           |

### 8.5 orders

| Policy                                  | Command | Expression                              |
|-----------------------------------------|---------|-----------------------------------------|
| Customers can view own orders           | SELECT  | `auth.uid() = customer_id`              |
| Customers can create orders             | INSERT  | `auth.uid() = customer_id`              |
| Sellers can view orders with their items| SELECT  | `is_seller_of_order(id)`                |
| Admins can view all orders              | SELECT  | `has_role(auth.uid(), 'admin')`         |
| Admins can update orders                | UPDATE  | `has_role(auth.uid(), 'admin')`         |

### 8.6 order_items

| Policy                              | Command | Expression                              |
|--------------------------------------|---------|-----------------------------------------|
| Customers can view own order items   | SELECT  | Join with orders.customer_id            |
| Customers can insert order items     | INSERT  | Join with orders.customer_id            |
| Sellers can view their order items   | SELECT  | `auth.uid() = seller_id`               |
| Admins can manage order items        | ALL     | `has_role(auth.uid(), 'admin')`         |

### 8.7 order_tracking

| Policy                              | Command | Expression                              |
|--------------------------------------|---------|-----------------------------------------|
| Customers can view own tracking      | SELECT  | Join with orders.customer_id            |
| Sellers can view order tracking      | SELECT  | Join with order_items.seller_id         |
| Sellers can insert order tracking    | INSERT  | Join with order_items.seller_id         |
| Sellers can update order tracking    | UPDATE  | Join with order_items.seller_id         |
| Admins can manage order tracking     | ALL     | `has_role(auth.uid(), 'admin')`         |

### 8.8 coupons

| Policy                   | Command | Expression                      |
|--------------------------|---------|---------------------------------|
| Anyone can view active   | SELECT  | `is_active = true`              |
| Admins can manage        | ALL     | `has_role(auth.uid(), 'admin')` |

### 8.9 forum_posts

| Policy                              | Command | Expression                      |
|--------------------------------------|---------|---------------------------------|
| Anyone can view forum posts          | SELECT  | `true`                          |
| Authenticated users can create       | INSERT  | `auth.uid() = user_id`         |
| Users can update own posts           | UPDATE  | `auth.uid() = user_id`         |
| Users can delete own posts           | DELETE  | `auth.uid() = user_id`         |
| Admins can manage all posts          | ALL     | `has_role(auth.uid(), 'admin')` |

### 8.10 forum_comments

| Policy                              | Command | Expression              |
|--------------------------------------|---------|-------------------------|
| Anyone can view comments             | SELECT  | `true`                  |
| Authenticated users can create       | INSERT  | `auth.uid() = user_id` |
| Users can update own comments        | UPDATE  | `auth.uid() = user_id` |
| Users can delete own comments        | DELETE  | `auth.uid() = user_id` |

### 8.11 forum_likes

| Policy                   | Command | Expression              |
|--------------------------|---------|-------------------------|
| Anyone can view likes    | SELECT  | `true`                  |
| Authenticated users like | INSERT  | `auth.uid() = user_id` |
| Users remove own likes   | DELETE  | `auth.uid() = user_id` |

### 8.12 wishlists

| Policy                    | Command | Expression              |
|---------------------------|---------|-------------------------|
| Users can view own        | SELECT  | `auth.uid() = user_id` |
| Users can add to wishlist | INSERT  | `auth.uid() = user_id` |
| Users can remove          | DELETE  | `auth.uid() = user_id` |

### 8.13 reviews

| Policy                | Command | Expression              |
|-----------------------|---------|-------------------------|
| Anyone can view       | SELECT  | `true`                  |
| Users can create      | INSERT  | `auth.uid() = user_id` |
| Users can update own  | UPDATE  | `auth.uid() = user_id` |
| Users can delete own  | DELETE  | `auth.uid() = user_id` |

### 8.14 notifications

| Policy                         | Command | Expression              |
|--------------------------------|---------|-------------------------|
| Users can view own             | SELECT  | `auth.uid() = user_id` |
| Users can update own           | UPDATE  | `auth.uid() = user_id` |
| Users can delete own           | DELETE  | `auth.uid() = user_id` |
| Service role can insert        | INSERT  | `true` (service role)   |

---

## 9. Storage Buckets

### 9.1 `product-images` (Public)

| Policy                                  | Command | Expression                                        |
|-----------------------------------------|---------|---------------------------------------------------|
| Public can view product images          | SELECT  | `bucket_id = 'product-images'`                    |
| Authenticated users can upload          | INSERT  | `bucket_id = 'product-images' AND uid = folder`   |
| Users can update own product images     | UPDATE  | `bucket_id = 'product-images' AND uid = folder`   |
| Users can delete own product images     | DELETE  | `bucket_id = 'product-images' AND uid = folder`   |

### 9.2 `shop-images` (Public)

| Policy                                  | Command | Expression                                        |
|-----------------------------------------|---------|---------------------------------------------------|
| Public can view shop images             | SELECT  | `bucket_id = 'shop-images'`                       |
| Sellers can upload shop images          | INSERT  | `bucket_id = 'shop-images' AND uid = folder`      |
| Users can update own shop images        | UPDATE  | `bucket_id = 'shop-images' AND uid = folder`      |
| Users can delete own shop images        | DELETE  | `bucket_id = 'shop-images' AND uid = folder`      |
| Admins can manage all shop images       | ALL     | `bucket_id = 'shop-images' AND has_role(admin)`   |

**Folder Convention:** Files are stored as `{user_id}/{filename}` — RLS checks `storage.foldername(name)[1]` against `auth.uid()`.

---

## 10. Edge Functions

### 10.1 `create-seller`
> **Admin only** — Creates a new seller account or converts existing customer to seller.
- **JWT Required:** Yes
- **Validates:** Caller must be admin
- **Actions:** Creates auth user → profile + role are auto-created by trigger → updates role to seller if needed

### 10.2 `delete-user`
> **Admin only** — Completely deletes a user and all cascaded data.
- **JWT Required:** Yes
- **Validates:** Caller must be admin, cannot delete self
- **Actions:** Deletes from auth.users (cascades to profiles, roles, etc.)

### 10.3 `update-user-password`
> **Admin only** — Resets a user's password.
- **JWT Required:** Yes
- **Validates:** Caller must be admin
- **Actions:** Uses admin API to update auth user password

### 10.4 `create-order-notifications`
> **Public** — Creates notifications for order events.
- **JWT Required:** No (called by service role / webhooks)
- **Actions:** Inserts notifications for customer and relevant sellers

### Configuration (`supabase/config.toml`)
```toml
project_id = "rnnipawqtzbhtgrlajmc"

[functions.create-seller]
verify_jwt = true

[functions.create-order-notifications]
verify_jwt = false
```

---

## 11. Authentication Flow

```
User Signup
    │
    ├─→ auth.users row created (Supabase Auth)
    │
    ├─→ Trigger: on_auth_user_created fires
    │       ├─→ Creates profiles row (user_id, full_name, phone)
    │       └─→ Creates user_roles row (user_id, role from metadata or 'customer')
    │
    └─→ Frontend: AuthContext fetches role via get_user_role()
            └─→ Redirects to appropriate dashboard
```

### Role-Based Routing
| Role     | Dashboard Route     | Access                                      |
|----------|---------------------|---------------------------------------------|
| admin    | /admin              | All pages + admin dashboard                  |
| seller   | /seller-dashboard   | Shop management, products, orders            |
| customer | /customer-dashboard | Browse, purchase, wishlist, forum             |

---

## 12. Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

Notifications table is realtime-enabled for instant notification delivery to the frontend `NotificationBell` component.

---

## 13. Required Secrets

| Secret Name                  | Purpose                                    |
|------------------------------|--------------------------------------------|
| `SUPABASE_URL`               | Backend API URL                            |
| `SUPABASE_ANON_KEY`          | Publishable/anonymous key                  |
| `SUPABASE_SERVICE_ROLE_KEY`  | Admin-level access for Edge Functions      |
| `SUPABASE_DB_URL`            | Direct database connection                 |
| `SUPABASE_PUBLISHABLE_KEY`   | Frontend client key                        |
| `LOVABLE_API_KEY`            | Lovable platform integration               |
| `RESEND_API_KEY`             | Email service (Resend) for notifications   |

---

## 14. Known Issues & Fixes

### 14.1 Products Showing Only One Product

**Problem:** Only 1 out of 3 approved products was visible to customers.

**Root Cause (Database):** All RLS policies on the `products` table were created as `RESTRICTIVE` instead of `PERMISSIVE`.
- RESTRICTIVE policies use `AND` logic — a customer had to satisfy ALL policies simultaneously
- Since a customer is NOT the `seller_id`, the "Sellers can view own products" policy failed, blocking access even though "Anyone can view approved products" passed

**Fix (Migration Applied):**
```sql
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view approved products" ON public.products;
DROP POLICY IF EXISTS "Sellers can view own products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Sellers can insert own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;

-- Recreated all as PERMISSIVE (default)
CREATE POLICY "Anyone can view approved products" ON public.products
  FOR SELECT TO public USING (is_approved = true);
-- ... (all 6 policies recreated as permissive)
```

**Root Cause (Frontend):** Default price filter in `Products.tsx` was set to ₹10,000 max, but 2 products had prices of ₹11,800 and ₹24,000.

**Fix:** Changed default `priceRange` from `[0, 10000]` to `[0, 100000]` in `src/pages/Products.tsx`.

### 14.2 Security Hardening Applied
- Revoked public `EXECUTE` on `has_role()` and `get_user_role()` functions
- Storage policies enforce folder-level ownership (`user_id/filename`)
- Edge Functions validate admin role before performing privileged operations

---

## 15. Restoration Instructions

### Step 1: Create Supabase Project
Create a new Supabase project (or use Lovable Cloud).

### Step 2: Execute Database Schema
1. Open the SQL Editor
2. Execute `public/backup/khetify-complete-backend-backup.sql`
3. **Then apply the PERMISSIVE fix migration** (see Section 14.1)

### Step 3: Deploy Edge Functions
```bash
# Copy edge function files
cp public/backup/edge-functions/*.ts supabase/functions/

# Deploy
supabase functions deploy create-seller
supabase functions deploy delete-user
supabase functions deploy update-user-password
supabase functions deploy create-order-notifications
```

### Step 4: Configure Secrets
Set all secrets listed in Section 13 in your Supabase project settings.

### Step 5: Verify
- [ ] All 14 tables created with RLS enabled
- [ ] All indexes created
- [ ] All functions and triggers active
- [ ] Storage buckets created (product-images, shop-images)
- [ ] Edge functions deployed
- [ ] Test: Sign up → profile auto-created → role assigned
- [ ] Test: Products page shows all approved products
- [ ] Test: Admin can manage users, sellers, products

---

## Quick Reference: SQL to Verify Setup

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Check indexes
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' ORDER BY tablename;

-- Check policies and their type
SELECT policyname, tablename, permissive, cmd 
FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Verify products are PERMISSIVE
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'products' AND schemaname = 'public';
```

---

> **Generated:** 2026-03-01 | **Project:** Khetify Agricultural Marketplace
