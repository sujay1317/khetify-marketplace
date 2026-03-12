using Khetify.Domain.Entities;
using Khetify.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderTracking> OrderTracking => Set<OrderTracking>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<ForumPost> ForumPosts => Set<ForumPost>();
    public DbSet<ForumComment> ForumComments => Set<ForumComment>();
    public DbSet<ForumLike> ForumLikes => Set<ForumLike>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==================== USER ====================
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasColumnName("id");
            e.Property(u => u.Email).HasColumnName("email").IsRequired();
            e.Property(u => u.PasswordHash).HasColumnName("password_hash").IsRequired();
            e.Property(u => u.EmailConfirmed).HasColumnName("email_confirmed");
            e.Property(u => u.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.Property(u => u.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");
            e.HasIndex(u => u.Email).IsUnique();
        });

        // ==================== PROFILE ====================
        modelBuilder.Entity<Profile>(e =>
        {
            e.ToTable("profiles");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.UserId).HasColumnName("user_id");
            e.Property(p => p.FullName).HasColumnName("full_name");
            e.Property(p => p.Phone).HasColumnName("phone");
            e.Property(p => p.AvatarUrl).HasColumnName("avatar_url");
            e.Property(p => p.ShopImage).HasColumnName("shop_image");
            e.Property(p => p.FreeDelivery).HasColumnName("free_delivery");
            e.Property(p => p.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.Property(p => p.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");
            e.HasOne(p => p.User).WithOne(u => u.Profile).HasForeignKey<Profile>(p => p.UserId);
            e.HasIndex(p => p.UserId).IsUnique();
        });

        // ==================== USER ROLE ====================
        modelBuilder.Entity<UserRole>(e =>
        {
            e.ToTable("user_roles");
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).HasColumnName("id");
            e.Property(r => r.UserId).HasColumnName("user_id");
            e.Property(r => r.Role).HasColumnName("role")
                .HasConversion(v => v.ToString().ToLower(), v => Enum.Parse<AppRole>(v, true));
            e.Property(r => r.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.HasOne(r => r.User).WithOne(u => u.UserRole).HasForeignKey<UserRole>(r => r.UserId);
            e.HasIndex(r => new { r.UserId, r.Role }).IsUnique();
        });

        // ==================== PRODUCT ====================
        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.SellerId).HasColumnName("seller_id");
            e.Property(p => p.Name).HasColumnName("name").IsRequired();
            e.Property(p => p.NameHi).HasColumnName("name_hi");
            e.Property(p => p.Description).HasColumnName("description");
            e.Property(p => p.DescriptionHi).HasColumnName("description_hi");
            e.Property(p => p.Price).HasColumnName("price").HasColumnType("decimal(10,2)");
            e.Property(p => p.OriginalPrice).HasColumnName("original_price").HasColumnType("decimal(10,2)");
            e.Property(p => p.Category).HasColumnName("category").IsRequired();
            e.Property(p => p.Image).HasColumnName("image");
            e.Property(p => p.Unit).HasColumnName("unit").HasDefaultValue("kg");
            e.Property(p => p.Stock).HasColumnName("stock").HasDefaultValue(0);
            e.Property(p => p.IsOrganic).HasColumnName("is_organic").HasDefaultValue(false);
            e.Property(p => p.IsApproved).HasColumnName("is_approved").HasDefaultValue(false);
            e.Property(p => p.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.Property(p => p.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");
            e.HasOne(p => p.Seller).WithMany(u => u.Products).HasForeignKey(p => p.SellerId);
            e.HasIndex(p => p.SellerId);
            e.HasIndex(p => p.Category);
            e.HasIndex(p => p.IsApproved);
        });

        // ==================== PRODUCT IMAGE ====================
        modelBuilder.Entity<ProductImage>(e =>
        {
            e.ToTable("product_images");
            e.HasKey(pi => pi.Id);
            e.Property(pi => pi.Id).HasColumnName("id");
            e.Property(pi => pi.ProductId).HasColumnName("product_id");
            e.Property(pi => pi.ImageUrl).HasColumnName("image_url").IsRequired();
            e.Property(pi => pi.DisplayOrder).HasColumnName("display_order").HasDefaultValue(0);
            e.Property(pi => pi.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.HasOne(pi => pi.Product).WithMany(p => p.Images).HasForeignKey(pi => pi.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // ==================== ORDER ====================
        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.HasKey(o => o.Id);
            e.Property(o => o.Id).HasColumnName("id");
            e.Property(o => o.CustomerId).HasColumnName("customer_id");
            e.Property(o => o.Total).HasColumnName("total").HasColumnType("decimal(10,2)");
            e.Property(o => o.Status).HasColumnName("status")
                .HasConversion(v => v.ToString().ToLower(), v => Enum.Parse<OrderStatus>(v, true))
                .HasDefaultValue(OrderStatus.Pending);
            e.Property(o => o.PaymentMethod).HasColumnName("payment_method").HasDefaultValue("cod");
            e.Property(o => o.ShippingAddress).HasColumnName("shipping_address").HasColumnType("jsonb");
            e.Property(o => o.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.Property(o => o.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");
            e.HasOne(o => o.Customer).WithMany(u => u.Orders).HasForeignKey(o => o.CustomerId);
            e.HasIndex(o => o.CustomerId);
            e.HasIndex(o => o.Status);
        });

        // ==================== ORDER ITEM ====================
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.ToTable("order_items");
            e.HasKey(oi => oi.Id);
            e.Property(oi => oi.Id).HasColumnName("id");
            e.Property(oi => oi.OrderId).HasColumnName("order_id");
            e.Property(oi => oi.ProductId).HasColumnName("product_id");
            e.Property(oi => oi.SellerId).HasColumnName("seller_id");
            e.Property(oi => oi.ProductName).HasColumnName("product_name").IsRequired();
            e.Property(oi => oi.Quantity).HasColumnName("quantity");
            e.Property(oi => oi.Price).HasColumnName("price").HasColumnType("decimal(10,2)");
            e.Property(oi => oi.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.HasOne(oi => oi.Order).WithMany(o => o.Items).HasForeignKey(oi => oi.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(oi => oi.Product).WithMany(p => p.OrderItems).HasForeignKey(oi => oi.ProductId).OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(oi => oi.OrderId);
            e.HasIndex(oi => oi.SellerId);
        });

        // ==================== ORDER TRACKING ====================
        modelBuilder.Entity<OrderTracking>(e =>
        {
            e.ToTable("order_tracking");
            e.HasKey(ot => ot.Id);
            e.Property(ot => ot.Id).HasColumnName("id");
            e.Property(ot => ot.OrderId).HasColumnName("order_id");
            e.Property(ot => ot.Status).HasColumnName("status").IsRequired();
            e.Property(ot => ot.Description).HasColumnName("description");
            e.Property(ot => ot.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.HasOne(ot => ot.Order).WithMany(o => o.Tracking).HasForeignKey(ot => ot.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(ot => ot.OrderId);
        });

        // ==================== REVIEW ====================
        modelBuilder.Entity<Review>(e =>
        {
            e.ToTable("reviews");
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).HasColumnName("id");
            e.Property(r => r.UserId).HasColumnName("user_id");
            e.Property(r => r.ProductId).HasColumnName("product_id");
            e.Property(r => r.Rating).HasColumnName("rating");
            e.Property(r => r.Comment).HasColumnName("comment");
            e.Property(r => r.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.Property(r => r.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");
            e.HasOne(r => r.User).WithMany(u => u.Reviews).HasForeignKey(r => r.UserId);
            e.HasOne(r => r.Product).WithMany(p => p.Reviews).HasForeignKey(r => r.ProductId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(r => r.ProductId);
        });

        // ==================== WISHLIST ====================
        modelBuilder.Entity<Wishlist>(e =>
        {
            e.ToTable("wishlists");
            e.HasKey(w => w.Id);
            e.Property(w => w.Id).HasColumnName("id");
            e.Property(w => w.UserId).HasColumnName("user_id");
            e.Property(w => w.ProductId).HasColumnName("product_id");
            e.Property(w => w.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.HasOne(w => w.User).WithMany(u => u.Wishlists).HasForeignKey(w => w.UserId);
            e.HasOne(w => w.Product).WithMany(p => p.Wishlists).HasForeignKey(w => w.ProductId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(w => new { w.UserId, w.ProductId }).IsUnique();
        });

        // ==================== COUPON ====================
        modelBuilder.Entity<Coupon>(e =>
        {
            e.ToTable("coupons");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id");
            e.Property(c => c.Code).HasColumnName("code").IsRequired();
            e.Property(c => c.DiscountType).HasColumnName("discount_type").HasDefaultValue("percentage");
            e.Property(c => c.DiscountValue).HasColumnName("discount_value").HasColumnType("decimal(10,2)");
            e.Property(c => c.MinOrderAmount).HasColumnName("min_order_amount").HasColumnType("decimal(10,2)");
            e.Property(c => c.MaxUses).HasColumnName("max_uses");
            e.Property(c => c.UsedCount).HasColumnName("used_count").HasDefaultValue(0);
            e.Property(c => c.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(c => c.ValidFrom).HasColumnName("valid_from").HasDefaultValueSql("now()");
            e.Property(c => c.ValidUntil).HasColumnName("valid_until");
            e.Property(c => c.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.Property(c => c.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");
            e.HasIndex(c => c.Code).IsUnique();
        });

        // ==================== NOTIFICATION ====================
        modelBuilder.Entity<Notification>(e =>
        {
            e.ToTable("notifications");
            e.HasKey(n => n.Id);
            e.Property(n => n.Id).HasColumnName("id");
            e.Property(n => n.UserId).HasColumnName("user_id");
            e.Property(n => n.OrderId).HasColumnName("order_id");
            e.Property(n => n.Title).HasColumnName("title").IsRequired();
            e.Property(n => n.Message).HasColumnName("message").IsRequired();
            e.Property(n => n.Type).HasColumnName("type").HasDefaultValue("info");
            e.Property(n => n.IsRead).HasColumnName("is_read").HasDefaultValue(false);
            e.Property(n => n.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.HasOne(n => n.User).WithMany(u => u.Notifications).HasForeignKey(n => n.UserId);
            e.HasOne(n => n.Order).WithMany(o => o.Notifications).HasForeignKey(n => n.OrderId).OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(n => n.UserId);
            e.HasIndex(n => n.IsRead);
        });

        // ==================== FORUM POST ====================
        modelBuilder.Entity<ForumPost>(e =>
        {
            e.ToTable("forum_posts");
            e.HasKey(fp => fp.Id);
            e.Property(fp => fp.Id).HasColumnName("id");
            e.Property(fp => fp.UserId).HasColumnName("user_id");
            e.Property(fp => fp.Title).HasColumnName("title").IsRequired();
            e.Property(fp => fp.Content).HasColumnName("content").IsRequired();
            e.Property(fp => fp.Category).HasColumnName("category").HasDefaultValue("general");
            e.Property(fp => fp.LikesCount).HasColumnName("likes_count").HasDefaultValue(0);
            e.Property(fp => fp.CommentsCount).HasColumnName("comments_count").HasDefaultValue(0);
            e.Property(fp => fp.IsPinned).HasColumnName("is_pinned").HasDefaultValue(false);
            e.Property(fp => fp.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.Property(fp => fp.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");
            e.HasOne(fp => fp.User).WithMany(u => u.ForumPosts).HasForeignKey(fp => fp.UserId);
            e.HasIndex(fp => fp.Category);
        });

        // ==================== FORUM COMMENT ====================
        modelBuilder.Entity<ForumComment>(e =>
        {
            e.ToTable("forum_comments");
            e.HasKey(fc => fc.Id);
            e.Property(fc => fc.Id).HasColumnName("id");
            e.Property(fc => fc.PostId).HasColumnName("post_id");
            e.Property(fc => fc.UserId).HasColumnName("user_id");
            e.Property(fc => fc.Content).HasColumnName("content").IsRequired();
            e.Property(fc => fc.LikesCount).HasColumnName("likes_count").HasDefaultValue(0);
            e.Property(fc => fc.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.Property(fc => fc.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");
            e.HasOne(fc => fc.Post).WithMany(fp => fp.Comments).HasForeignKey(fc => fc.PostId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(fc => fc.User).WithMany(u => u.ForumComments).HasForeignKey(fc => fc.UserId);
        });

        // ==================== FORUM LIKE ====================
        modelBuilder.Entity<ForumLike>(e =>
        {
            e.ToTable("forum_likes");
            e.HasKey(fl => fl.Id);
            e.Property(fl => fl.Id).HasColumnName("id");
            e.Property(fl => fl.UserId).HasColumnName("user_id");
            e.Property(fl => fl.PostId).HasColumnName("post_id");
            e.Property(fl => fl.CommentId).HasColumnName("comment_id");
            e.Property(fl => fl.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.HasOne(fl => fl.User).WithMany(u => u.ForumLikes).HasForeignKey(fl => fl.UserId);
            e.HasOne(fl => fl.Post).WithMany(fp => fp.Likes).HasForeignKey(fl => fl.PostId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(fl => fl.Comment).WithMany(fc => fc.Likes).HasForeignKey(fl => fl.CommentId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(fl => new { fl.UserId, fl.PostId }).IsUnique().HasFilter("post_id IS NOT NULL");
            e.HasIndex(fl => new { fl.UserId, fl.CommentId }).IsUnique().HasFilter("comment_id IS NOT NULL");
        });
    }
}
