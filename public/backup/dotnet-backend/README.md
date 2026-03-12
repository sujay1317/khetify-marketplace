# Khetify .NET 10 Backend

## 🚀 Quick Start

### Prerequisites
- .NET 10 SDK
- PostgreSQL 16+ (or Docker)

### Option 1: Docker (Recommended)
```bash
docker-compose up -d
```
API available at `http://localhost:8080`
Swagger UI at `http://localhost:8080/swagger`

### Option 2: Local Development
```bash
# Start PostgreSQL and create database
createdb khetify
psql khetify < init.sql

# Update connection string in appsettings.json
# Then run:
cd src/Khetify.API
dotnet run
```

## 📁 Project Structure
```
KhetifyApi.sln
├── src/
│   ├── Khetify.Domain/          # Entities, Enums
│   ├── Khetify.Application/     # DTOs, Interfaces
│   ├── Khetify.Infrastructure/  # EF Core, Services
│   └── Khetify.API/             # Controllers, Program.cs
├── Dockerfile
├── docker-compose.yml
└── init.sql
```

## 🔑 API Endpoints

### Auth
- `POST /api/auth/register` - Register customer
- `POST /api/auth/login` - Login
- `POST /api/auth/change-password` - Change password (auth)

### Users (Admin)
- `GET /api/users` - List all users
- `GET /api/users/me` - Current user
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/update-password` - Admin reset password
- `DELETE /api/users/{id}` - Delete user

### Products
- `GET /api/products` - List (filter: category, search, isOrganic, sellerId, sortBy)
- `GET /api/products/{id}` - Detail
- `POST /api/products` - Create (seller/admin)
- `PUT /api/products/{id}` - Update (seller/admin)
- `DELETE /api/products/{id}` - Delete (seller/admin)
- `POST /api/products/{id}/approve` - Approve (admin)
- `GET /api/products/{id}/images` - Get images
- `POST /api/products/{id}/images` - Add image
- `DELETE /api/products/images/{imageId}` - Delete image

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/{id}` - Detail
- `POST /api/orders` - Create order
- `PUT /api/orders/{id}/status` - Update status (seller/admin)
- `GET /api/orders/{id}/tracking` - Get tracking
- `POST /api/orders/{id}/tracking` - Add tracking
- `GET /api/orders/seller` - Seller's orders

### Reviews
- `GET /api/reviews/product/{productId}` - Product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/{id}` - Update review
- `DELETE /api/reviews/{id}` - Delete review

### Wishlist
- `GET /api/wishlist` - User's wishlist
- `POST /api/wishlist` - Add item
- `DELETE /api/wishlist/{productId}` - Remove item

### Coupons
- `GET /api/coupons` - List coupons
- `POST /api/coupons` - Create (admin)
- `PUT /api/coupons/{id}` - Update (admin)
- `DELETE /api/coupons/{id}` - Delete (admin)
- `POST /api/coupons/validate` - Validate coupon

### Notifications
- `GET /api/notifications` - User's notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete

### Forum
- `GET /api/forum/posts` - List posts
- `GET /api/forum/posts/{id}` - Post detail
- `POST /api/forum/posts` - Create post
- `PUT /api/forum/posts/{id}` - Update post
- `DELETE /api/forum/posts/{id}` - Delete post
- `GET /api/forum/posts/{postId}/comments` - Comments
- `POST /api/forum/posts/{postId}/comments` - Add comment
- `DELETE /api/forum/comments/{id}` - Delete comment
- `POST /api/forum/posts/{postId}/like` - Toggle like
- `POST /api/forum/comments/{commentId}/like` - Toggle like
- `POST /api/forum/posts/{id}/pin` - Toggle pin (admin)

### Sellers
- `POST /api/sellers` - Create seller (admin)
- `GET /api/sellers` - List all sellers
- `GET /api/sellers/{id}/public` - Public info

### Upload
- `POST /api/upload/{folder}` - Upload image

## 🔐 Authentication
JWT Bearer token. Include in header: `Authorization: Bearer <token>`

## 🌐 Environment Variables (Production)
```env
ConnectionStrings__DefaultConnection=Host=...;Port=5432;Database=khetify;Username=...;Password=...
Jwt__Key=YourSecretKeyMinimum32Characters
Jwt__Issuer=KhetifyAPI
Jwt__Audience=KhetifyApp
Cors__Origins__0=https://your-frontend.com
```

## 🔄 EF Core Migrations
```bash
cd src/Khetify.Infrastructure
dotnet ef migrations add InitialCreate --startup-project ../Khetify.API
dotnet ef database update --startup-project ../Khetify.API
```
