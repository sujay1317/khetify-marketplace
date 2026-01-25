# Khetify Backend Backup

## Overview
This folder contains the complete backend backup for the Khetify agricultural marketplace application.

## Contents

### 1. Database Schema (`khetify-complete-backend-backup.sql`)
Complete SQL file containing:
- **Enums**: `app_role` (admin, seller, customer)
- **14 Tables**: profiles, user_roles, products, product_images, orders, order_items, order_tracking, coupons, forum_posts, forum_comments, forum_likes, wishlists, reviews, notifications
- **7 Database Functions**: has_role, get_user_role, get_seller_public_info, update_updated_at, handle_new_user, update_post_comments_count, update_likes_count
- **10 Triggers**: Auth user creation, updated_at timestamps, forum counters
- **56 RLS Policies**: Complete access control for all tables
- **Storage Configuration**: product-images and shop-images buckets with policies

### 2. Edge Functions (`edge-functions/`)
- `create-seller.ts` - Admin-only seller creation/conversion
- `delete-user.ts` - Admin-only complete user deletion
- `update-user-password.ts` - Admin-only password management
- `create-order-notifications.ts` - Order notification system
- `config.toml` - Edge function configuration

## Restoration Instructions

### Database
1. Connect to your Supabase project
2. Open the SQL Editor
3. Execute `khetify-complete-backend-backup.sql`

### Edge Functions
1. Copy files from `edge-functions/` to `supabase/functions/`
2. Deploy using: `supabase functions deploy`

### Required Secrets
Ensure these secrets are configured:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes
- All tables have RLS enabled
- Admin functions use service role for privileged operations
- Storage uses folder-based ownership (user_id as folder name)

## Generated
Date: 2025-01-25
Project ID: rnnipawqtzbhtgrlajmc
