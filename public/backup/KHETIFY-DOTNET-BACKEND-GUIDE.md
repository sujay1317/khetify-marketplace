# 🌾 KHETIFY - Complete .NET 10 + PostgreSQL Backend Guide

> **Version:** 1.0 | **Last Updated:** March 2026
> **Stack:** .NET 10 Web API + PostgreSQL 16 + Entity Framework Core + JWT Auth
> **Architecture:** Clean Architecture (Domain → Application → Infrastructure → API)

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Folder Structure](#2-architecture--folder-structure)
3. [Prerequisites & Setup](#3-prerequisites--setup)
4. [Database Schema (PostgreSQL)](#4-database-schema-postgresql)
5. [Entity Models (C#)](#5-entity-models-c)
6. [DbContext & Configuration](#6-dbcontext--configuration)
7. [Authentication & Authorization (JWT)](#7-authentication--authorization-jwt)
8. [API Controllers & Endpoints](#8-api-controllers--endpoints)
9. [DTOs (Data Transfer Objects)](#9-dtos-data-transfer-objects)
10. [Services (Business Logic)](#10-services-business-logic)
11. [Authorization Policies (RLS Equivalent)](#11-authorization-policies-rls-equivalent)
12. [File Storage (Product & Shop Images)](#12-file-storage-product--shop-images)
13. [Database Migrations](#13-database-migrations)
14. [Indexes & Performance](#14-indexes--performance)
15. [Notification System](#15-notification-system)
16. [Error Handling & Validation](#16-error-handling--validation)
17. [appsettings.json Configuration](#17-appsettingsjson-configuration)
18. [Testing](#18-testing)
19. [Deployment](#19-deployment)
20. [ER Diagram](#20-er-diagram)

---

## 1. Project Overview

**Khetify** is an agricultural e-commerce platform connecting farmers with sellers of seeds, fertilizers, pesticides, and farm tools. It has 3 user roles:

| Role | Description |
|------|-------------|
| **Admin** | Full control: manage users, products, orders, coupons, sellers |
| **Seller** | Manage own products, view/fulfill own orders, shop profile |
| **Customer** | Browse products, place orders, wishlist, reviews, forum |

### Key Features
- Role-based access control (Admin/Seller/Customer)
- Product catalog with categories, organic tags, multi-image support
- Order management with tracking timeline
- Coupon/discount system
- Wishlist & reviews
- Farmer forum (posts, comments, likes)
- Notification system
- Hindi/Marathi localization support
- File upload for product & shop images

---

## 2. Architecture & Folder Structure

```
Khetify.Backend/
│
├── Khetify.Domain/                    # Entities, Enums, Interfaces
│   ├── Entities/
│   │   ├── Profile.cs
│   │   ├── UserRole.cs
│   │   ├── Product.cs
│   │   ├── ProductImage.cs
│   │   ├── Order.cs
│   │   ├── OrderItem.cs
│   │   ├── OrderTracking.cs
│   │   ├── Review.cs
│   │   ├── Wishlist.cs
│   │   ├── Coupon.cs
│   │   ├── Notification.cs
│   │   ├── ForumPost.cs
│   │   ├── ForumComment.cs
│   │   └── ForumLike.cs
│   ├── Enums/
│   │   └── AppRole.cs
│   └── Interfaces/
│       ├── IProductRepository.cs
│       ├── IOrderRepository.cs
│       └── IUserRepository.cs
│
├── Khetify.Application/               # Services, DTOs, Validators
│   ├── DTOs/
│   │   ├── Auth/
│   │   ├── Products/
│   │   ├── Orders/
│   │   ├── Users/
│   │   └── Forum/
│   ├── Services/
│   │   ├── AuthService.cs
│   │   ├── ProductService.cs
│   │   ├── OrderService.cs
│   │   ├── UserService.cs
│   │   ├── CouponService.cs
│   │   ├── NotificationService.cs
│   │   ├── ForumService.cs
│   │   ├── WishlistService.cs
│   │   ├── ReviewService.cs
│   │   └── FileStorageService.cs
│   ├── Interfaces/
│   └── Validators/
│
├── Khetify.Infrastructure/            # EF Core, Repos, External Services
│   ├── Data/
│   │   ├── KhetifyDbContext.cs
│   │   └── Migrations/
│   ├── Repositories/
│   ├── Services/
│   │   └── JwtTokenService.cs
│   └── Configuration/
│       ├── ProfileConfiguration.cs
│       ├── ProductConfiguration.cs
│       └── ... (one per entity)
│
├── Khetify.API/                       # Controllers, Middleware, Program.cs
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ProductsController.cs
│   │   ├── OrdersController.cs
│   │   ├── UsersController.cs
│   │   ├── CouponsController.cs
│   │   ├── WishlistController.cs
│   │   ├── ReviewsController.cs
│   │   ├── ForumController.cs
│   │   ├── NotificationsController.cs
│   │   └── FilesController.cs
│   ├── Middleware/
│   │   ├── ExceptionHandlingMiddleware.cs
│   │   └── RoleAuthorizationMiddleware.cs
│   ├── Filters/
│   │   └── OwnershipFilter.cs
│   ├── Program.cs
│   └── appsettings.json
│
└── Khetify.Tests/                     # Unit & Integration Tests
    ├── Services/
    └── Controllers/
```

---

## 3. Prerequisites & Setup

### Install Required Tools
```bash
# .NET 10 SDK
dotnet --version  # Should show 10.x

# PostgreSQL 16
psql --version

# Entity Framework CLI
dotnet tool install --global dotnet-ef
```

### Create the Solution
```bash
dotnet new sln -n Khetify

# Create projects
dotnet new classlib -n Khetify.Domain
dotnet new classlib -n Khetify.Application
dotnet new classlib -n Khetify.Infrastructure
dotnet new webapi -n Khetify.API
dotnet new xunit -n Khetify.Tests

# Add to solution
dotnet sln add Khetify.Domain Khetify.Application Khetify.Infrastructure Khetify.API Khetify.Tests

# Add project references
dotnet add Khetify.Application reference Khetify.Domain
dotnet add Khetify.Infrastructure reference Khetify.Application
dotnet add Khetify.API reference Khetify.Infrastructure
dotnet add Khetify.Tests reference Khetify.Application Khetify.Infrastructure
```

### Install NuGet Packages
```bash
# Infrastructure
cd Khetify.Infrastructure
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design

# API
cd ../Khetify.API
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
dotnet add package FluentValidation.AspNetCore
dotnet add package Swashbuckle.AspNetCore

# Application
cd ../Khetify.Application
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package FluentValidation
```

### Create PostgreSQL Database
```sql
CREATE DATABASE khetify_db;
CREATE USER khetify_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE khetify_db TO khetify_user;
```

---

## 4. Database Schema (PostgreSQL)

### 4.1 Enum Type
```sql
CREATE TYPE app_role AS ENUM ('admin', 'seller', 'customer');
```

### 4.2 All Tables (14 Total)

```sql
-- ============================================================
-- TABLE 1: users (Authentication - managed by your auth system)
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 2: profiles
-- ============================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    shop_image TEXT,
    free_delivery BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 3: user_roles
-- ============================================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 4: products
-- ============================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_hi TEXT,
    description TEXT,
    description_hi TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    category TEXT NOT NULL,
    unit TEXT DEFAULT 'kg',
    stock INTEGER DEFAULT 0,
    image TEXT,
    is_organic BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 5: product_images
-- ============================================================
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 6: orders
-- ============================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cod',
    shipping_address JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 7: order_items
-- ============================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 8: order_tracking
-- ============================================================
CREATE TABLE order_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 9: reviews
-- ============================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 10: wishlists
-- ============================================================
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, product_id)
);

-- ============================================================
-- TABLE 11: coupons
-- ============================================================
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC NOT NULL,
    min_order_amount NUMERIC DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 12: notifications
-- ============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABLE 13: forum_posts
-- ============================================================
CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 14: forum_comments
-- ============================================================
CREATE TABLE forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 15: forum_likes
-- ============================================================
CREATE TABLE forum_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, post_id),
    UNIQUE (user_id, comment_id)
);
```

### 4.3 Entity Relationship Diagram (Text)
```
users ──────┬──── profiles (1:1)
            ├──── user_roles (1:1)
            ├──── products (1:N, seller)
            ├──── orders (1:N, customer)
            ├──── reviews (1:N)
            ├──── wishlists (1:N)
            ├──── notifications (1:N)
            ├──── forum_posts (1:N)
            ├──── forum_comments (1:N)
            └──── forum_likes (1:N)

products ───┬──── product_images (1:N)
            ├──── order_items (1:N)
            ├──── reviews (1:N)
            └──── wishlists (1:N)

orders ─────┬──── order_items (1:N)
            ├──── order_tracking (1:N)
            └──── notifications (1:N)

forum_posts ┬──── forum_comments (1:N)
            └──── forum_likes (1:N)

forum_comments── forum_likes (1:N)
```

---

## 5. Entity Models (C#)

### 5.1 Enum
```csharp
// Khetify.Domain/Enums/AppRole.cs
namespace Khetify.Domain.Enums;

public enum AppRole
{
    Admin,
    Seller,
    Customer
}
```

### 5.2 Base Entity
```csharp
// Khetify.Domain/Entities/BaseEntity.cs
namespace Khetify.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

### 5.3 User
```csharp
// Khetify.Domain/Entities/User.cs
namespace Khetify.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool EmailConfirmed { get; set; } = false;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Profile? Profile { get; set; }
    public UserRole? UserRole { get; set; }
    public ICollection<Product> Products { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<Wishlist> Wishlists { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<ForumPost> ForumPosts { get; set; } = [];
    public ICollection<ForumComment> ForumComments { get; set; } = [];
    public ICollection<ForumLike> ForumLikes { get; set; } = [];
}
```

### 5.4 Profile
```csharp
// Khetify.Domain/Entities/Profile.cs
namespace Khetify.Domain.Entities;

public class Profile : BaseEntity
{
    public Guid UserId { get; set; }
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public string? ShopImage { get; set; }
    public bool FreeDelivery { get; set; } = false;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
}
```

### 5.5 UserRole
```csharp
// Khetify.Domain/Entities/UserRole.cs
using Khetify.Domain.Enums;

namespace Khetify.Domain.Entities;

public class UserRole : BaseEntity
{
    public Guid UserId { get; set; }
    public AppRole Role { get; set; } = AppRole.Customer;

    // Navigation
    public User User { get; set; } = null!;
}
```

### 5.6 Product
```csharp
// Khetify.Domain/Entities/Product.cs
namespace Khetify.Domain.Entities;

public class Product : BaseEntity
{
    public Guid SellerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameHi { get; set; }
    public string? Description { get; set; }
    public string? DescriptionHi { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Unit { get; set; } = "kg";
    public int Stock { get; set; } = 0;
    public string? Image { get; set; }
    public bool IsOrganic { get; set; } = false;
    public bool IsApproved { get; set; } = false;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Seller { get; set; } = null!;
    public ICollection<ProductImage> Images { get; set; } = [];
    public ICollection<OrderItem> OrderItems { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<Wishlist> Wishlists { get; set; } = [];
}
```

### 5.7 ProductImage
```csharp
// Khetify.Domain/Entities/ProductImage.cs
namespace Khetify.Domain.Entities;

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;

    // Navigation
    public Product Product { get; set; } = null!;
}
```

### 5.8 Order
```csharp
// Khetify.Domain/Entities/Order.cs
using System.Text.Json;

namespace Khetify.Domain.Entities;

public class Order : BaseEntity
{
    public Guid CustomerId { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = "pending";
    public string PaymentMethod { get; set; } = "cod";
    public JsonDocument? ShippingAddress { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Customer { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<OrderTracking> Tracking { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
}
```

### 5.9 OrderItem
```csharp
// Khetify.Domain/Entities/OrderItem.cs
namespace Khetify.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? SellerId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
    public Product? Product { get; set; }
    public User? Seller { get; set; }
}
```

### 5.10 OrderTracking
```csharp
// Khetify.Domain/Entities/OrderTracking.cs
namespace Khetify.Domain.Entities;

public class OrderTracking : BaseEntity
{
    public Guid OrderId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
}
```

### 5.11 Review, Wishlist, Coupon, Notification, Forum entities
```csharp
// Khetify.Domain/Entities/Review.cs
namespace Khetify.Domain.Entities;

public class Review : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Product Product { get; set; } = null!;
}

// Khetify.Domain/Entities/Wishlist.cs
namespace Khetify.Domain.Entities;

public class Wishlist : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }

    public User User { get; set; } = null!;
    public Product Product { get; set; } = null!;
}

// Khetify.Domain/Entities/Coupon.cs
namespace Khetify.Domain.Entities;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "percentage";
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; } = 0;
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime? ValidFrom { get; set; } = DateTime.UtcNow;
    public DateTime? ValidUntil { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// Khetify.Domain/Entities/Notification.cs
namespace Khetify.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info";
    public Guid? OrderId { get; set; }
    public bool IsRead { get; set; } = false;

    public User User { get; set; } = null!;
    public Order? Order { get; set; }
}

// Khetify.Domain/Entities/ForumPost.cs
namespace Khetify.Domain.Entities;

public class ForumPost : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = "general";
    public int LikesCount { get; set; } = 0;
    public int CommentsCount { get; set; } = 0;
    public bool IsPinned { get; set; } = false;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<ForumComment> Comments { get; set; } = [];
    public ICollection<ForumLike> Likes { get; set; } = [];
}

// Khetify.Domain/Entities/ForumComment.cs
namespace Khetify.Domain.Entities;

public class ForumComment : BaseEntity
{
    public Guid PostId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public int LikesCount { get; set; } = 0;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ForumPost Post { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<ForumLike> Likes { get; set; } = [];
}

// Khetify.Domain/Entities/ForumLike.cs
namespace Khetify.Domain.Entities;

public class ForumLike : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid? PostId { get; set; }
    public Guid? CommentId { get; set; }

    public User User { get; set; } = null!;
    public ForumPost? Post { get; set; }
    public ForumComment? Comment { get; set; }
}
```

---

## 6. DbContext & Configuration

### 6.1 KhetifyDbContext
```csharp
// Khetify.Infrastructure/Data/KhetifyDbContext.cs
using Khetify.Domain.Entities;
using Khetify.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Khetify.Infrastructure.Data;

public class KhetifyDbContext : DbContext
{
    static KhetifyDbContext()
    {
        // Map the C# enum to PostgreSQL enum
        NpgsqlConnection.GlobalTypeMapper.MapEnum<AppRole>("app_role");
    }

    public KhetifyDbContext(DbContextOptions<KhetifyDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderTracking> OrderTrackings => Set<OrderTracking>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<ForumPost> ForumPosts => Set<ForumPost>();
    public DbSet<ForumComment> ForumComments => Set<ForumComment>();
    public DbSet<ForumLike> ForumLikes => Set<ForumLike>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // PostgreSQL enum mapping
        modelBuilder.HasPostgresEnum<AppRole>("app_role");

        // Apply all entity configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(KhetifyDbContext).Assembly);

        // Global: auto-update UpdatedAt
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            var updatedAtProp = entity.FindProperty("UpdatedAt");
            if (updatedAtProp != null)
            {
                // Handled in SaveChanges override
            }
        }
    }

    public override int SaveChanges()
    {
        SetTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        SetTimestamps();
        return base.SaveChangesAsync(ct);
    }

    private void SetTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Properties.Any(p => p.Metadata.Name == "UpdatedAt"))
            {
                entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
        }
    }
}
```

### 6.2 Entity Configurations (Fluent API)
```csharp
// Khetify.Infrastructure/Configuration/ProfileConfiguration.cs
using Khetify.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Khetify.Infrastructure.Configuration;

public class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.ToTable("profiles");
        builder.HasKey(p => p.Id);
        builder.HasIndex(p => p.UserId).IsUnique();
        builder.HasOne(p => p.User)
               .WithOne(u => u.Profile)
               .HasForeignKey<Profile>(p => p.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

// Khetify.Infrastructure/Configuration/ProductConfiguration.cs
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.HasKey(p => p.Id);
        builder.HasIndex(p => p.SellerId);
        builder.HasIndex(p => p.Category);
        builder.HasIndex(p => p.IsApproved);
        builder.HasOne(p => p.Seller)
               .WithMany(u => u.Products)
               .HasForeignKey(p => p.SellerId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

// Khetify.Infrastructure/Configuration/OrderConfiguration.cs
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);
        builder.HasIndex(o => o.CustomerId);
        builder.HasIndex(o => o.Status);
        builder.Property(o => o.ShippingAddress)
               .HasColumnType("jsonb");
        builder.HasOne(o => o.Customer)
               .WithMany(u => u.Orders)
               .HasForeignKey(o => o.CustomerId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

// Khetify.Infrastructure/Configuration/WishlistConfiguration.cs
public class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
{
    public void Configure(EntityTypeBuilder<Wishlist> builder)
    {
        builder.ToTable("wishlists");
        builder.HasIndex(w => new { w.UserId, w.ProductId }).IsUnique();
    }
}

// Khetify.Infrastructure/Configuration/ForumLikeConfiguration.cs
public class ForumLikeConfiguration : IEntityTypeConfiguration<ForumLike>
{
    public void Configure(EntityTypeBuilder<ForumLike> builder)
    {
        builder.ToTable("forum_likes");
        builder.HasIndex(l => new { l.UserId, l.PostId }).IsUnique();
        builder.HasIndex(l => new { l.UserId, l.CommentId }).IsUnique();
    }
}
```

---

## 7. Authentication & Authorization (JWT)

### 7.1 JWT Token Service
```csharp
// Khetify.Infrastructure/Services/JwtTokenService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Khetify.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Khetify.Infrastructure.Services;

public class JwtTokenService
{
    private readonly IConfiguration _config;

    public JwtTokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(Guid userId, string email, AppRole role)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role.ToString().ToLower()),
            new Claim("user_id", userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

### 7.2 Auth Service
```csharp
// Khetify.Application/Services/AuthService.cs
using BCrypt.Net;
using Khetify.Domain.Entities;
using Khetify.Domain.Enums;
using Khetify.Infrastructure.Data;
using Khetify.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Application.Services;

public class AuthService
{
    private readonly KhetifyDbContext _db;
    private readonly JwtTokenService _jwt;

    public AuthService(KhetifyDbContext db, JwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<(bool Success, string Token, string? Error)> SignUp(
        string email, string password, string fullName, string phone, AppRole role)
    {
        // Check existing user
        if (await _db.Users.AnyAsync(u => u.Email == email.ToLower()))
            return (false, "", "Email already registered");

        // Don't allow admin registration
        if (role == AppRole.Admin)
            return (false, "", "Cannot register as admin");

        var user = new User
        {
            Email = email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            EmailConfirmed = false // Set true after email verification
        };

        _db.Users.Add(user);

        // Create profile
        _db.Profiles.Add(new Profile
        {
            UserId = user.Id,
            FullName = fullName,
            Phone = phone
        });

        // Create role
        _db.UserRoles.Add(new UserRole
        {
            UserId = user.Id,
            Role = role
        });

        await _db.SaveChangesAsync();

        var token = _jwt.GenerateToken(user.Id, user.Email, role);
        return (true, token, null);
    }

    public async Task<(bool Success, string Token, string? Error)> SignIn(
        string email, string password)
    {
        var user = await _db.Users
            .Include(u => u.UserRole)
            .FirstOrDefaultAsync(u => u.Email == email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return (false, "", "Invalid email or password");

        var role = user.UserRole?.Role ?? AppRole.Customer;
        var token = _jwt.GenerateToken(user.Id, user.Email, role);
        return (true, token, null);
    }
}
```

### 7.3 Program.cs JWT Configuration
```csharp
// In Khetify.API/Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireRole("admin"));
    options.AddPolicy("SellerOnly", p => p.RequireRole("seller"));
    options.AddPolicy("CustomerOnly", p => p.RequireRole("customer"));
    options.AddPolicy("SellerOrAdmin", p => p.RequireRole("admin", "seller"));
    options.AddPolicy("Authenticated", p => p.RequireAuthenticatedUser());
});
```

---

## 8. API Controllers & Endpoints

### 8.1 Complete API Route Map

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| **Auth** | | | | |
| POST | `/api/auth/signup` | ❌ | Any | Register new user |
| POST | `/api/auth/login` | ❌ | Any | Login & get JWT |
| GET | `/api/auth/me` | ✅ | Any | Get current user profile |
| **Products** | | | | |
| GET | `/api/products` | ❌ | Any | List approved products (public) |
| GET | `/api/products/{id}` | ❌ | Any | Get product detail |
| GET | `/api/products/seller` | ✅ | Seller | List seller's own products |
| POST | `/api/products` | ✅ | Seller | Create product |
| PUT | `/api/products/{id}` | ✅ | Seller/Admin | Update product |
| DELETE | `/api/products/{id}` | ✅ | Seller/Admin | Delete product |
| PATCH | `/api/products/{id}/approve` | ✅ | Admin | Approve product |
| POST | `/api/products/{id}/images` | ✅ | Seller | Upload product images |
| **Orders** | | | | |
| GET | `/api/orders` | ✅ | Customer | List customer's orders |
| GET | `/api/orders/{id}` | ✅ | Customer/Seller/Admin | Get order detail |
| POST | `/api/orders` | ✅ | Customer | Create order |
| PATCH | `/api/orders/{id}/status` | ✅ | Admin | Update order status |
| GET | `/api/orders/seller` | ✅ | Seller | List seller's orders |
| GET | `/api/orders/{id}/tracking` | ✅ | Customer/Seller | Get tracking timeline |
| POST | `/api/orders/{id}/tracking` | ✅ | Seller | Add tracking event |
| GET | `/api/orders/all` | ✅ | Admin | All orders |
| **Users (Admin)** | | | | |
| GET | `/api/users` | ✅ | Admin | List all users |
| POST | `/api/users/create-seller` | ✅ | Admin | Create seller account |
| DELETE | `/api/users/{id}` | ✅ | Admin | Delete user |
| PATCH | `/api/users/{id}/password` | ✅ | Admin | Reset password |
| **Wishlist** | | | | |
| GET | `/api/wishlist` | ✅ | Customer | Get wishlist |
| POST | `/api/wishlist` | ✅ | Customer | Add to wishlist |
| DELETE | `/api/wishlist/{productId}` | ✅ | Customer | Remove from wishlist |
| **Reviews** | | | | |
| GET | `/api/reviews/product/{productId}` | ❌ | Any | Get product reviews |
| POST | `/api/reviews` | ✅ | Customer | Create review |
| PUT | `/api/reviews/{id}` | ✅ | Owner | Update review |
| DELETE | `/api/reviews/{id}` | ✅ | Owner | Delete review |
| **Coupons** | | | | |
| GET | `/api/coupons` | ❌ | Any | List active coupons |
| GET | `/api/coupons/validate/{code}` | ✅ | Customer | Validate coupon |
| POST | `/api/coupons` | ✅ | Admin | Create coupon |
| PUT | `/api/coupons/{id}` | ✅ | Admin | Update coupon |
| DELETE | `/api/coupons/{id}` | ✅ | Admin | Delete coupon |
| **Forum** | | | | |
| GET | `/api/forum/posts` | ❌ | Any | List posts |
| GET | `/api/forum/posts/{id}` | ❌ | Any | Get post detail |
| POST | `/api/forum/posts` | ✅ | Any | Create post |
| PUT | `/api/forum/posts/{id}` | ✅ | Owner | Update post |
| DELETE | `/api/forum/posts/{id}` | ✅ | Owner/Admin | Delete post |
| POST | `/api/forum/posts/{id}/comments` | ✅ | Any | Add comment |
| POST | `/api/forum/like` | ✅ | Any | Toggle like |
| **Notifications** | | | | |
| GET | `/api/notifications` | ✅ | Any | Get user's notifications |
| PATCH | `/api/notifications/{id}/read` | ✅ | Owner | Mark as read |
| PATCH | `/api/notifications/read-all` | ✅ | Any | Mark all as read |
| DELETE | `/api/notifications/{id}` | ✅ | Owner | Delete notification |
| **Files** | | | | |
| POST | `/api/files/product-image` | ✅ | Seller | Upload product image |
| POST | `/api/files/shop-image` | ✅ | Seller | Upload shop image |

### 8.2 Auth Controller
```csharp
// Khetify.API/Controllers/AuthController.cs
using Khetify.Application.DTOs.Auth;
using Khetify.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
    {
        var (success, token, error) = await _authService.SignUp(
            request.Email, request.Password, request.FullName,
            request.Phone, request.Role);

        if (!success)
            return BadRequest(new { error });

        return Ok(new { token, message = "Account created successfully" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (success, token, error) = await _authService.SignIn(
            request.Email, request.Password);

        if (!success)
            return Unauthorized(new { error });

        return Ok(new { token });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetUserId();
        var user = await _authService.GetUserProfile(userId);
        return Ok(user);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirst("user_id")!.Value);
}
```

### 8.3 Products Controller
```csharp
// Khetify.API/Controllers/ProductsController.cs
using Khetify.Application.DTOs.Products;
using Khetify.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ProductService _productService;

    public ProductsController(ProductService productService)
    {
        _productService = productService;
    }

    /// <summary>Public: List approved products with filters</summary>
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? category,
        [FromQuery] bool? isOrganic,
        [FromQuery] string? search,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? sortBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _productService.GetApprovedProducts(
            category, isOrganic, search, minPrice, maxPrice, sortBy, page, pageSize);
        return Ok(result);
    }

    /// <summary>Public: Get product by ID</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await _productService.GetProductById(id);
        if (product == null) return NotFound();
        return Ok(product);
    }

    /// <summary>Seller: Get own products</summary>
    [HttpGet("seller")]
    [Authorize(Policy = "SellerOnly")]
    public async Task<IActionResult> GetSellerProducts()
    {
        var userId = GetUserId();
        var products = await _productService.GetSellerProducts(userId);
        return Ok(products);
    }

    /// <summary>Seller: Create product</summary>
    [HttpPost]
    [Authorize(Policy = "SellerOnly")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var userId = GetUserId();
        var product = await _productService.CreateProduct(userId, request);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    /// <summary>Seller/Admin: Update product</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = "SellerOrAdmin")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        var userId = GetUserId();
        var role = GetUserRole();
        var result = await _productService.UpdateProduct(id, userId, role, request);
        if (!result.Success) return Forbid();
        return Ok(result.Product);
    }

    /// <summary>Seller/Admin: Delete product</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "SellerOrAdmin")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var userId = GetUserId();
        var role = GetUserRole();
        var success = await _productService.DeleteProduct(id, userId, role);
        if (!success) return Forbid();
        return NoContent();
    }

    /// <summary>Admin: Approve product</summary>
    [HttpPatch("{id:guid}/approve")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ApproveProduct(Guid id, [FromBody] ApproveProductRequest request)
    {
        await _productService.SetApproval(id, request.IsApproved);
        return Ok(new { message = "Product approval updated" });
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirst("user_id")!.Value);
    private string GetUserRole() => User.FindFirst(System.Security.Claims.ClaimTypes.Role)!.Value;
}
```

### 8.4 Orders Controller
```csharp
// Khetify.API/Controllers/OrdersController.cs
using Khetify.Application.DTOs.Orders;
using Khetify.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;

    public OrdersController(OrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>Customer: Get own orders</summary>
    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var orders = await _orderService.GetCustomerOrders(GetUserId());
        return Ok(orders);
    }

    /// <summary>Customer: Place order</summary>
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var order = await _orderService.CreateOrder(GetUserId(), request);
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    /// <summary>Get order detail (owner, seller, or admin)</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var order = await _orderService.GetOrderDetail(id, GetUserId(), GetUserRole());
        if (order == null) return NotFound();
        return Ok(order);
    }

    /// <summary>Seller: Get orders containing seller's products</summary>
    [HttpGet("seller")]
    [Authorize(Policy = "SellerOnly")]
    public async Task<IActionResult> GetSellerOrders()
    {
        var orders = await _orderService.GetSellerOrders(GetUserId());
        return Ok(orders);
    }

    /// <summary>Admin: Get all orders</summary>
    [HttpGet("all")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var orders = await _orderService.GetAllOrders(status, page, pageSize);
        return Ok(orders);
    }

    /// <summary>Admin: Update order status</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        await _orderService.UpdateOrderStatus(id, request.Status);
        return Ok(new { message = "Status updated" });
    }

    /// <summary>Seller: Add tracking event</summary>
    [HttpPost("{id:guid}/tracking")]
    [Authorize(Policy = "SellerOrAdmin")]
    public async Task<IActionResult> AddTracking(Guid id, [FromBody] AddTrackingRequest request)
    {
        await _orderService.AddTrackingEvent(id, GetUserId(), request);
        return Ok(new { message = "Tracking added" });
    }

    /// <summary>Get order tracking timeline</summary>
    [HttpGet("{id:guid}/tracking")]
    public async Task<IActionResult> GetTracking(Guid id)
    {
        var tracking = await _orderService.GetOrderTracking(id, GetUserId(), GetUserRole());
        return Ok(tracking);
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirst("user_id")!.Value);
    private string GetUserRole() => User.FindFirst(System.Security.Claims.ClaimTypes.Role)!.Value;
}
```

### 8.5 Admin Users Controller
```csharp
// Khetify.API/Controllers/UsersController.cs
using Khetify.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsers();
        return Ok(users);
    }

    [HttpPost("create-seller")]
    public async Task<IActionResult> CreateSeller([FromBody] CreateSellerRequest request)
    {
        var result = await _userService.CreateSeller(request);
        if (!result.Success) return BadRequest(new { error = result.Error });
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var adminId = GetUserId();
        var result = await _userService.DeleteUser(id, adminId);
        if (!result.Success) return BadRequest(new { error = result.Error });
        return Ok(new { message = "User deleted" });
    }

    [HttpPatch("{id:guid}/password")]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
    {
        var result = await _userService.ResetUserPassword(id, request.NewPassword);
        if (!result) return BadRequest(new { error = "Failed to update password" });
        return Ok(new { message = "Password updated" });
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirst("user_id")!.Value);
}
```

---

## 9. DTOs (Data Transfer Objects)

```csharp
// Khetify.Application/DTOs/Auth/
namespace Khetify.Application.DTOs.Auth;

public record SignUpRequest(
    string Email,
    string Password,
    string FullName,
    string Phone,
    AppRole Role = AppRole.Customer
);

public record LoginRequest(string Email, string Password);

public record UserProfileResponse(
    Guid Id, string Email, string FullName, string? Phone,
    string Role, string? AvatarUrl, string? ShopImage, bool FreeDelivery
);

// Khetify.Application/DTOs/Products/
namespace Khetify.Application.DTOs.Products;

public record CreateProductRequest(
    string Name, string? NameHi, string? Description, string? DescriptionHi,
    decimal Price, decimal? OriginalPrice, string Category,
    string Unit, int Stock, string? Image, bool IsOrganic
);

public record UpdateProductRequest(
    string? Name, string? NameHi, string? Description, string? DescriptionHi,
    decimal? Price, decimal? OriginalPrice, string? Category,
    string? Unit, int? Stock, string? Image, bool? IsOrganic
);

public record ApproveProductRequest(bool IsApproved);

public record ProductResponse(
    Guid Id, Guid SellerId, string Name, string? NameHi,
    string? Description, string? DescriptionHi,
    decimal Price, decimal? OriginalPrice, string Category,
    string Unit, int Stock, string? Image, bool IsOrganic,
    bool IsApproved, DateTime CreatedAt,
    string? SellerName, List<string> Images
);

// Khetify.Application/DTOs/Orders/
namespace Khetify.Application.DTOs.Orders;

public record CreateOrderRequest(
    List<OrderItemDto> Items,
    ShippingAddressDto ShippingAddress,
    string PaymentMethod = "cod",
    string? CouponCode = null
);

public record OrderItemDto(
    Guid ProductId, string ProductName, Guid SellerId,
    int Quantity, decimal Price
);

public record ShippingAddressDto(
    string FullName, string Phone, string Address,
    string City, string State, string Pincode
);

public record UpdateStatusRequest(string Status);

public record AddTrackingRequest(string Status, string? Description);

public record CreateSellerRequest(
    string Email, string Password, string FullName,
    string? Phone, bool FreeDelivery = false
);

public record ResetPasswordRequest(string NewPassword);
```

---

## 10. Services (Business Logic)

### 10.1 Product Service
```csharp
// Khetify.Application/Services/ProductService.cs
using Khetify.Application.DTOs.Products;
using Khetify.Domain.Entities;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Application.Services;

public class ProductService
{
    private readonly KhetifyDbContext _db;

    public ProductService(KhetifyDbContext db) => _db = db;

    public async Task<object> GetApprovedProducts(
        string? category, bool? isOrganic, string? search,
        decimal? minPrice, decimal? maxPrice, string? sortBy,
        int page, int pageSize)
    {
        var query = _db.Products
            .Where(p => p.IsApproved)
            .Include(p => p.Images)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);
        if (isOrganic.HasValue)
            query = query.Where(p => p.IsOrganic == isOrganic.Value);
        if (!string.IsNullOrEmpty(search))
            query = query.Where(p =>
                p.Name.ToLower().Contains(search.ToLower()) ||
                (p.NameHi != null && p.NameHi.Contains(search)));
        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);
        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        query = sortBy switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new { items, total, page, pageSize };
    }

    public async Task<ProductResponse?> GetProductById(Guid id)
    {
        var p = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Seller).ThenInclude(s => s.Profile)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsApproved);

        if (p == null) return null;

        return new ProductResponse(
            p.Id, p.SellerId, p.Name, p.NameHi, p.Description, p.DescriptionHi,
            p.Price, p.OriginalPrice, p.Category, p.Unit, p.Stock, p.Image,
            p.IsOrganic, p.IsApproved, p.CreatedAt,
            p.Seller?.Profile?.FullName,
            p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.ImageUrl).ToList()
        );
    }

    public async Task<List<Product>> GetSellerProducts(Guid sellerId)
    {
        return await _db.Products
            .Where(p => p.SellerId == sellerId)
            .Include(p => p.Images)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Product> CreateProduct(Guid sellerId, CreateProductRequest req)
    {
        var product = new Product
        {
            SellerId = sellerId,
            Name = req.Name,
            NameHi = req.NameHi,
            Description = req.Description,
            DescriptionHi = req.DescriptionHi,
            Price = req.Price,
            OriginalPrice = req.OriginalPrice,
            Category = req.Category,
            Unit = req.Unit,
            Stock = req.Stock,
            Image = req.Image,
            IsOrganic = req.IsOrganic,
            IsApproved = false // Needs admin approval
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return product;
    }

    public async Task<(bool Success, Product? Product)> UpdateProduct(
        Guid productId, Guid userId, string role, UpdateProductRequest req)
    {
        var product = await _db.Products.FindAsync(productId);
        if (product == null) return (false, null);

        // Only owner or admin can update
        if (role != "admin" && product.SellerId != userId)
            return (false, null);

        if (req.Name != null) product.Name = req.Name;
        if (req.NameHi != null) product.NameHi = req.NameHi;
        if (req.Description != null) product.Description = req.Description;
        if (req.Price.HasValue) product.Price = req.Price.Value;
        if (req.OriginalPrice.HasValue) product.OriginalPrice = req.OriginalPrice.Value;
        if (req.Category != null) product.Category = req.Category;
        if (req.Unit != null) product.Unit = req.Unit;
        if (req.Stock.HasValue) product.Stock = req.Stock.Value;
        if (req.Image != null) product.Image = req.Image;
        if (req.IsOrganic.HasValue) product.IsOrganic = req.IsOrganic.Value;

        await _db.SaveChangesAsync();
        return (true, product);
    }

    public async Task<bool> DeleteProduct(Guid productId, Guid userId, string role)
    {
        var product = await _db.Products.FindAsync(productId);
        if (product == null) return false;
        if (role != "admin" && product.SellerId != userId) return false;

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task SetApproval(Guid productId, bool isApproved)
    {
        var product = await _db.Products.FindAsync(productId);
        if (product != null)
        {
            product.IsApproved = isApproved;
            await _db.SaveChangesAsync();
        }
    }
}
```

### 10.2 Order Service
```csharp
// Khetify.Application/Services/OrderService.cs
using Khetify.Application.DTOs.Orders;
using Khetify.Domain.Entities;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Khetify.Application.Services;

public class OrderService
{
    private readonly KhetifyDbContext _db;
    private readonly NotificationService _notificationService;

    public OrderService(KhetifyDbContext db, NotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task<Order> CreateOrder(Guid customerId, CreateOrderRequest req)
    {
        var order = new Order
        {
            CustomerId = customerId,
            Total = req.Items.Sum(i => i.Price * i.Quantity),
            PaymentMethod = req.PaymentMethod,
            ShippingAddress = JsonSerializer.SerializeToDocument(req.ShippingAddress),
            Status = "pending"
        };

        _db.Orders.Add(order);

        // Add order items
        foreach (var item in req.Items)
        {
            _db.OrderItems.Add(new OrderItem
            {
                OrderId = order.Id,
                ProductId = item.ProductId,
                SellerId = item.SellerId,
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                Price = item.Price
            });

            // Decrease stock
            var product = await _db.Products.FindAsync(item.ProductId);
            if (product != null)
                product.Stock = Math.Max(0, product.Stock - item.Quantity);
        }

        // Add initial tracking
        _db.OrderTrackings.Add(new OrderTracking
        {
            OrderId = order.Id,
            Status = "Order Placed",
            Description = "Your order has been placed successfully"
        });

        await _db.SaveChangesAsync();

        // Send notifications to sellers & admins
        await _notificationService.CreateOrderNotifications(order.Id, customerId);

        return order;
    }

    public async Task<List<Order>> GetCustomerOrders(Guid customerId)
    {
        return await _db.Orders
            .Where(o => o.CustomerId == customerId)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Order>> GetSellerOrders(Guid sellerId)
    {
        var orderIds = await _db.OrderItems
            .Where(oi => oi.SellerId == sellerId)
            .Select(oi => oi.OrderId)
            .Distinct()
            .ToListAsync();

        return await _db.Orders
            .Where(o => orderIds.Contains(o.Id))
            .Include(o => o.Items.Where(i => i.SellerId == sellerId))
            .Include(o => o.Customer).ThenInclude(c => c.Profile)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<object?> GetOrderDetail(Guid orderId, Guid userId, string role)
    {
        var order = await _db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Tracking)
            .Include(o => o.Customer).ThenInclude(c => c.Profile)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return null;

        // Authorization check
        if (role == "admin") return order;
        if (role == "customer" && order.CustomerId == userId) return order;
        if (role == "seller" && order.Items.Any(i => i.SellerId == userId)) return order;

        return null;
    }

    public async Task<object> GetAllOrders(string? status, int page, int pageSize)
    {
        var query = _db.Orders.Include(o => o.Items)
            .Include(o => o.Customer).ThenInclude(c => c.Profile)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(o => o.Status == status);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new { items, total, page, pageSize };
    }

    public async Task UpdateOrderStatus(Guid orderId, string status)
    {
        var order = await _db.Orders.FindAsync(orderId);
        if (order != null)
        {
            order.Status = status;
            await _db.SaveChangesAsync();
        }
    }

    public async Task AddTrackingEvent(Guid orderId, Guid userId, AddTrackingRequest req)
    {
        _db.OrderTrackings.Add(new OrderTracking
        {
            OrderId = orderId,
            Status = req.Status,
            Description = req.Description
        });
        await _db.SaveChangesAsync();
    }

    public async Task<List<OrderTracking>> GetOrderTracking(
        Guid orderId, Guid userId, string role)
    {
        return await _db.OrderTrackings
            .Where(t => t.OrderId == orderId)
            .OrderBy(t => t.CreatedAt)
            .ToListAsync();
    }
}
```

---

## 11. Authorization Policies (RLS Equivalent)

In .NET, Row-Level Security is implemented through **service-layer checks** and **authorization filters**.

### 11.1 Access Control Matrix

| Resource | Admin | Seller | Customer | Public |
|----------|-------|--------|----------|--------|
| **Products (approved)** | CRUD + approve | Own: CRU | Read | Read |
| **Products (unapproved)** | CRUD | Own: CRUD | ❌ | ❌ |
| **Orders** | Read all, update status | Read own items | Own: CR | ❌ |
| **Order Tracking** | CRUD | Own orders: CR | Own: Read | ❌ |
| **Profiles** | Read all | Own: RU | Own: RU | ❌ |
| **User Roles** | CRUD | Read own | Read own | ❌ |
| **Coupons** | CRUD | Read active | Read active | Read active |
| **Reviews** | Read all | Read all | Own: CRD | Read all |
| **Wishlists** | ❌ | ❌ | Own: CRD | ❌ |
| **Notifications** | Read own | Read own | Read own | ❌ |
| **Forum Posts** | CRUD all | Own: CRUD | Own: CRUD | Read |
| **Forum Comments** | CRUD all | Own: CRUD | Own: CRUD | Read |
| **Forum Likes** | Own: CD | Own: CD | Own: CD | Read |

### 11.2 Ownership Filter
```csharp
// Khetify.API/Filters/OwnershipFilter.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Khetify.API.Filters;

/// <summary>
/// Ensures users can only access their own resources (equivalent to RLS)
/// </summary>
public class OwnershipFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var userId = context.HttpContext.User.FindFirst("user_id")?.Value;
        var role = context.HttpContext.User.FindFirst(
            System.Security.Claims.ClaimTypes.Role)?.Value;

        if (role == "admin")
        {
            await next(); // Admins bypass ownership checks
            return;
        }

        // For resource-specific checks, the service layer handles authorization
        await next();
    }
}
```

---

## 12. File Storage (Product & Shop Images)

```csharp
// Khetify.Application/Services/FileStorageService.cs
namespace Khetify.Application.Services;

public class FileStorageService
{
    private readonly string _storagePath;

    public FileStorageService(IConfiguration config)
    {
        _storagePath = config["Storage:BasePath"] ?? "wwwroot/uploads";
    }

    public async Task<string> UploadProductImage(IFormFile file, Guid productId)
    {
        var folder = Path.Combine(_storagePath, "product-images");
        Directory.CreateDirectory(folder);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{productId}_{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(folder, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/product-images/{fileName}";
    }

    public async Task<string> UploadShopImage(IFormFile file, Guid userId)
    {
        var folder = Path.Combine(_storagePath, "shop-images");
        Directory.CreateDirectory(folder);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{userId}_{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(folder, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/shop-images/{fileName}";
    }

    public void DeleteFile(string fileUrl)
    {
        var filePath = Path.Combine(_storagePath, fileUrl.TrimStart('/').Replace("uploads/", ""));
        if (File.Exists(filePath))
            File.Delete(filePath);
    }
}
```

---

## 13. Database Migrations

```bash
# Create initial migration
cd Khetify.Infrastructure
dotnet ef migrations add InitialCreate -s ../Khetify.API

# Apply migration
dotnet ef database update -s ../Khetify.API

# Seed admin user (create a seeder)
```

### Seed Data
```csharp
// Khetify.Infrastructure/Data/DataSeeder.cs
using BCrypt.Net;
using Khetify.Domain.Entities;
using Khetify.Domain.Enums;

namespace Khetify.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAdminUser(KhetifyDbContext db)
    {
        if (await db.Users.AnyAsync(u => u.Email == "admin@khetify.shop"))
            return;

        var admin = new User
        {
            Email = "admin@khetify.shop",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456"),
            EmailConfirmed = true
        };

        db.Users.Add(admin);
        db.Profiles.Add(new Profile { UserId = admin.Id, FullName = "Admin" });
        db.UserRoles.Add(new UserRole { UserId = admin.Id, Role = AppRole.Admin });

        await db.SaveChangesAsync();
    }
}
```

---

## 14. Indexes & Performance

```sql
-- Performance indexes (add in migration)
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_approved ON products(is_approved);
CREATE INDEX idx_products_is_organic ON products(is_organic);
CREATE INDEX idx_products_price ON products(price);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_seller_id ON order_items(seller_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_order_tracking_order_id ON order_tracking(order_id);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);

CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_forum_likes_user_post ON forum_likes(user_id, post_id);
CREATE INDEX idx_forum_likes_user_comment ON forum_likes(user_id, comment_id);
```

---

## 15. Notification System

```csharp
// Khetify.Application/Services/NotificationService.cs
using Khetify.Domain.Entities;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Application.Services;

public class NotificationService
{
    private readonly KhetifyDbContext _db;

    public NotificationService(KhetifyDbContext db) => _db = db;

    public async Task CreateOrderNotifications(Guid orderId, Guid customerId)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Customer).ThenInclude(c => c.Profile)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return;

        var customerName = order.Customer?.Profile?.FullName ?? "Customer";
        var notifications = new List<Notification>();

        // Notify sellers
        var sellerIds = order.Items
            .Where(i => i.SellerId.HasValue)
            .Select(i => i.SellerId!.Value)
            .Distinct();

        foreach (var sellerId in sellerIds)
        {
            notifications.Add(new Notification
            {
                UserId = sellerId,
                Title = "New Order Received! 🛒",
                Message = $"{customerName} placed an order worth ₹{order.Total}.",
                Type = "order",
                OrderId = orderId
            });
        }

        // Notify admins
        var adminIds = await _db.UserRoles
            .Where(r => r.Role == Domain.Enums.AppRole.Admin)
            .Select(r => r.UserId)
            .ToListAsync();

        foreach (var adminId in adminIds)
        {
            notifications.Add(new Notification
            {
                UserId = adminId,
                Title = "New Order Placed! 📦",
                Message = $"{customerName} placed an order worth ₹{order.Total} with {order.Items.Count} item(s).",
                Type = "order",
                OrderId = orderId
            });
        }

        _db.Notifications.AddRange(notifications);
        await _db.SaveChangesAsync();
    }

    public async Task<List<Notification>> GetUserNotifications(Guid userId)
    {
        return await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();
    }

    public async Task MarkAsRead(Guid notificationId, Guid userId)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
        if (notification != null)
        {
            notification.IsRead = true;
            await _db.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsRead(Guid userId)
    {
        await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }
}
```

---

## 16. Error Handling & Validation

```csharp
// Khetify.API/Middleware/ExceptionHandlingMiddleware.cs
namespace Khetify.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UnauthorizedAccessException)
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { error = "Forbidden" });
        }
        catch (KeyNotFoundException ex)
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new { error = "Internal server error" });
        }
    }
}

// FluentValidation Example
// Khetify.Application/Validators/CreateProductValidator.cs
using FluentValidation;
using Khetify.Application.DTOs.Products;

namespace Khetify.Application.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.Category).NotEmpty();
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Unit).NotEmpty();
    }
}
```

---

## 17. appsettings.json Configuration

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=khetify_db;Username=khetify_user;Password=your_secure_password"
  },
  "Jwt": {
    "Secret": "your-256-bit-secret-key-minimum-32-characters-long!",
    "Issuer": "Khetify.API",
    "Audience": "Khetify.Client",
    "ExpirationDays": 7
  },
  "Storage": {
    "BasePath": "wwwroot/uploads"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "https://khetify.shop"]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

---

## 18. Program.cs (Complete Setup)

```csharp
// Khetify.API/Program.cs
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Khetify.Application.Services;
using Khetify.Infrastructure.Data;
using Khetify.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<KhetifyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireRole("admin"));
    options.AddPolicy("SellerOnly", p => p.RequireRole("seller"));
    options.AddPolicy("CustomerOnly", p => p.RequireRole("customer"));
    options.AddPolicy("SellerOrAdmin", p => p.RequireRole("admin", "seller"));
});

// Services
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<FileStorageService>();
builder.Services.AddScoped<CouponService>();
builder.Services.AddScoped<ForumService>();
builder.Services.AddScoped<WishlistService>();
builder.Services.AddScoped<ReviewService>();

// Validation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Khetify.Application.Validators.CreateProductValidator>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware pipeline
app.UseMiddleware<Khetify.API.Middleware.ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // For uploaded images
app.UseCors("AllowClient");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed admin on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<KhetifyDbContext>();
    await db.Database.MigrateAsync();
    await DataSeeder.SeedAdminUser(db);
}

app.Run();
```

---

## 19. Deployment

### Docker
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish "Khetify.API/Khetify.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Khetify.API.dll"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=khetify_db;Username=khetify_user;Password=your_secure_password
      - Jwt__Secret=your-256-bit-secret-key-minimum-32-characters-long!
      - Jwt__Issuer=Khetify.API
      - Jwt__Audience=Khetify.Client
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: khetify_db
      POSTGRES_USER: khetify_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 20. ER Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    users     │────>│   profiles   │     │  user_roles  │
│             │     │              │     │              │
│ id (PK)     │     │ user_id (FK) │     │ user_id (FK) │
│ email       │     │ full_name    │     │ role (enum)  │
│ password    │     │ phone        │     └──────────────┘
│ hash        │     │ avatar_url   │
└──────┬──────┘     │ shop_image   │
       │            │ free_delivery│
       │            └──────────────┘
       │
       ├────────────────────────────────────────────┐
       │                                            │
       ▼                                            ▼
┌──────────────┐                           ┌──────────────┐
│   products   │                           │    orders     │
│              │                           │              │
│ id (PK)      │                           │ id (PK)      │
│ seller_id(FK)│                           │ customer_id  │
│ name         │                           │ total        │
│ name_hi      │                           │ status       │
│ price        │                           │ payment      │
│ category     │                           │ shipping_addr│
│ stock        │                           └──────┬───────┘
│ is_approved  │                                  │
│ is_organic   │                                  │
└──────┬───────┘                           ┌──────┴───────┐
       │                                   │              │
       ├──── product_images (1:N)          │ order_items  │
       │     - image_url                   │ - product_id │
       │     - display_order               │ - seller_id  │
       │                                   │ - quantity   │
       ├──── reviews (1:N)                 │ - price      │
       │     - user_id, rating             │              │
       │                                   └──────────────┘
       └──── wishlists (1:N)               
             - user_id                     ┌──────────────┐
                                           │order_tracking│
┌──────────────┐                           │ - order_id   │
│   coupons    │                           │ - status     │
│ code, type   │                           │ - description│
│ discount     │                           └──────────────┘
│ valid dates  │
└──────────────┘                           ┌──────────────┐
                                           │notifications │
┌──────────────┐                           │ - user_id    │
│ forum_posts  │──── forum_comments (1:N)  │ - title      │
│ - user_id    │     - user_id, content    │ - message    │
│ - title      │                           │ - order_id   │
│ - content    │──── forum_likes (1:N)     │ - is_read    │
│ - category   │     - user_id             └──────────────┘
│ - likes_count│     - post_id/comment_id
└──────────────┘
```

---

## 🚀 Quick Start Summary

```bash
# 1. Clone & setup
git clone <your-repo>
cd Khetify.Backend

# 2. Configure database connection in appsettings.json

# 3. Run migrations
dotnet ef database update -p Khetify.Infrastructure -s Khetify.API

# 4. Run the API
cd Khetify.API
dotnet run

# 5. Open Swagger: https://localhost:5001/swagger

# 6. Test: POST /api/auth/signup → POST /api/auth/login → Use JWT token
```

---

> **Note:** This guide maps 1:1 with the existing Khetify frontend. Replace the Supabase client calls with `fetch('/api/...')` calls using the JWT token in the `Authorization: Bearer <token>` header.
