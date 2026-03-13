# Khetify Frontend — .NET Backend Edition

## Overview
This is the modified React frontend that connects to the **Khetify .NET 10 Backend** instead of Supabase.

## Key Changes from Supabase Version

### New Files
- `src/services/api.ts` — Complete REST API client replacing all Supabase SDK calls
- `src/contexts/AuthContext.tsx` — JWT-based authentication (replaces Supabase Auth)
- `src/hooks/useWishlist.ts` — Uses REST API instead of Supabase queries

### What Changed
| Feature | Supabase Version | .NET Version |
|---------|-----------------|-------------|
| Auth | `supabase.auth.signIn()` | `authApi.login()` via JWT |
| Queries | `supabase.from('table').select()` | `productsApi.getAll()` REST calls |
| Realtime | `supabase.channel().subscribe()` | Polling (add SignalR for realtime) |
| Storage | `supabase.storage.upload()` | `uploadApi.productImage()` multipart |
| Edge Functions | `supabase.functions.invoke()` | Direct API controller calls |

### Migration Steps for Each File
Every file that imports `supabase` needs to be updated:

1. Replace `import { supabase } from '@/integrations/supabase/client'` with API service imports
2. Replace Supabase query chains with API function calls
3. Replace `supabase.auth.*` calls with `authApi.*` calls
4. Replace `supabase.storage.*` calls with `uploadApi.*` calls
5. Remove realtime subscriptions (or replace with polling/SignalR)

### Files Requiring Changes (listed by import count)
- `src/pages/SellerDashboard.tsx` — Product CRUD, orders, image upload
- `src/pages/Products.tsx` — Product listing, filtering
- `src/pages/ProductDetail.tsx` — Product detail, reviews, gallery
- `src/pages/Checkout.tsx` — Order creation
- `src/pages/AdminDashboard.tsx` — Admin operations
- `src/pages/FarmerForum.tsx` — Forum posts, comments, likes
- `src/pages/CustomerProfile.tsx` — Profile management
- `src/pages/CustomerOrders.tsx` — Order history
- `src/pages/Wishlist.tsx` — Wishlist management
- `src/pages/Sellers.tsx` — Seller listing
- `src/pages/SellerStore.tsx` — Seller store page
- `src/pages/SellerHome.tsx` — Seller dashboard home
- `src/pages/admin/ManageOrders.tsx` — Order management
- `src/pages/admin/ManageUsers.tsx` — User management
- `src/components/home/FeaturedProductsSection.tsx` — Featured products
- `src/components/product/ProductReviews.tsx` — Reviews
- `src/components/notifications/NotificationBell.tsx` — Notifications
- `src/components/admin/CouponManager.tsx` — Coupons
- `src/components/admin/AnalyticsCharts.tsx` — Analytics

## Setup

```bash
# 1. Copy .env.example to .env
cp .env.example .env

# 2. Update VITE_API_URL to point to your .NET backend
# For local: http://localhost:8080/api
# For Azure: https://your-app.azurewebsites.net/api

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev
```

## Example Migration Pattern

**Before (Supabase):**
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_approved', true);
```

**After (.NET API):**
```typescript
import { productsApi } from '@/services/api';

const result = await productsApi.getAll();
const products = result.data;
```

**Auth Before:**
```typescript
const { error } = await supabase.auth.signInWithPassword({ email, password });
```

**Auth After:**
```typescript
const response = await authApi.login({ email, password });
apiClient.setToken(response.token);
```

## Notes
- Remove `@supabase/supabase-js` dependency
- Remove `src/integrations/supabase/` directory
- Realtime features need SignalR integration for equivalent functionality
- File uploads use multipart/form-data to .NET API endpoints
