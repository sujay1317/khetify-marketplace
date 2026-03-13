using Khetify.Domain.Entities;
using Khetify.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Data;

public class KhetifyDbContext : DbContext
{
    public KhetifyDbContext(DbContextOptions<KhetifyDbContext> options) : base(options) { }

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

        // ===== User =====
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).IsRequired().HasMaxLength(255);
            e.Property(u => u.PasswordHash).IsRequired();
        });

        // ===== Profile =====
        modelBuilder.Entity<Profile>(e =>
        {
            e.ToTable("profiles");
            e.HasKey(p => p.Id);
            e.HasIndex(p => p.UserId).IsUnique();
            e.HasOne(p => p.User).WithOne(u => u.Profile).HasForeignKey<Profile>(p => p.UserId).OnDelete(DeleteBehavior.Cascade);
            e.Property(p => p.FullName).HasMaxLength(255);
            e.Property(p => p.Phone).HasMaxLength(20);
        });

        // ===== UserRole =====
        modelBuilder.Entity<UserRole>(e =>
        {
            e.ToTable("user_roles");
            e.HasKey(r => r.Id);
            e.HasIndex(r => new { r.UserId, r.Role }).IsUnique();
            e.HasOne(r => r.User).WithOne(u => u.UserRole).HasForeignKey<UserRole>(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
            e.Property(r => r.Role).HasConversion<string>().IsRequired();
        });

        // ===== Product =====
        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.HasKey(p => p.Id);
            e.HasIndex(p => p.SellerId);
            e.HasIndex(p => p.Category);
            e.HasIndex(p => p.IsApproved);
            e.HasOne(p => p.Seller).WithMany(u => u.Products).HasForeignKey(p => p.SellerId).OnDelete(DeleteBehavior.Cascade);
            e.Property(p => p.Name).IsRequired().HasMaxLength(255);
            e.Property(p => p.Price).HasColumnType("numeric(10,2)");
            e.Property(p => p.OriginalPrice).HasColumnType("numeric(10,2)");
        });

        // ===== ProductImage =====
        modelBuilder.Entity<ProductImage>(e =>
        {
            e.ToTable("product_images");
            e.HasKey(pi => pi.Id);
            e.HasOne(pi => pi.Product).WithMany(p => p.Images).HasForeignKey(pi => pi.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===== Order =====
        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.HasKey(o => o.Id);
            e.HasIndex(o => o.CustomerId);
            e.HasIndex(o => o.Status);
            e.HasOne(o => o.Customer).WithMany(u => u.Orders).HasForeignKey(o => o.CustomerId).OnDelete(DeleteBehavior.Cascade);
            e.Property(o => o.Total).HasColumnType("numeric(10,2)");
            e.Property(o => o.ShippingAddress).HasColumnType("jsonb");
        });

        // ===== OrderItem =====
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.ToTable("order_items");
            e.HasKey(oi => oi.Id);
            e.HasIndex(oi => oi.SellerId);
            e.HasOne(oi => oi.Order).WithMany(o => o.Items).HasForeignKey(oi => oi.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(oi => oi.Product).WithMany(p => p.OrderItems).HasForeignKey(oi => oi.ProductId).OnDelete(DeleteBehavior.SetNull);
            e.Property(oi => oi.Price).HasColumnType("numeric(10,2)");
        });

        // ===== OrderTracking =====
        modelBuilder.Entity<OrderTracking>(e =>
        {
            e.ToTable("order_tracking");
            e.HasKey(ot => ot.Id);
            e.HasOne(ot => ot.Order).WithMany(o => o.Tracking).HasForeignKey(ot => ot.OrderId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===== Review =====
        modelBuilder.Entity<Review>(e =>
        {
            e.ToTable("reviews");
            e.HasKey(r => r.Id);
            e.HasIndex(r => new { r.UserId, r.ProductId }).IsUnique();
            e.HasOne(r => r.User).WithMany(u => u.Reviews).HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.Product).WithMany(p => p.Reviews).HasForeignKey(r => r.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===== Wishlist =====
        modelBuilder.Entity<Wishlist>(e =>
        {
            e.ToTable("wishlists");
            e.HasKey(w => w.Id);
            e.HasIndex(w => new { w.UserId, w.ProductId }).IsUnique();
            e.HasOne(w => w.User).WithMany(u => u.Wishlists).HasForeignKey(w => w.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(w => w.Product).WithMany(p => p.Wishlists).HasForeignKey(w => w.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===== Coupon =====
        modelBuilder.Entity<Coupon>(e =>
        {
            e.ToTable("coupons");
            e.HasKey(c => c.Id);
            e.HasIndex(c => c.Code).IsUnique();
            e.Property(c => c.DiscountValue).HasColumnType("numeric(10,2)");
            e.Property(c => c.MinOrderAmount).HasColumnType("numeric(10,2)");
        });

        // ===== Notification =====
        modelBuilder.Entity<Notification>(e =>
        {
            e.ToTable("notifications");
            e.HasKey(n => n.Id);
            e.HasIndex(n => n.UserId);
            e.HasOne(n => n.User).WithMany(u => u.Notifications).HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(n => n.Order).WithMany(o => o.Notifications).HasForeignKey(n => n.OrderId).OnDelete(DeleteBehavior.SetNull);
        });

        // ===== ForumPost =====
        modelBuilder.Entity<ForumPost>(e =>
        {
            e.ToTable("forum_posts");
            e.HasKey(fp => fp.Id);
            e.HasIndex(fp => fp.Category);
            e.HasOne(fp => fp.User).WithMany(u => u.ForumPosts).HasForeignKey(fp => fp.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===== ForumComment =====
        modelBuilder.Entity<ForumComment>(e =>
        {
            e.ToTable("forum_comments");
            e.HasKey(fc => fc.Id);
            e.HasOne(fc => fc.User).WithMany(u => u.ForumComments).HasForeignKey(fc => fc.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(fc => fc.Post).WithMany(fp => fp.Comments).HasForeignKey(fc => fc.PostId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===== ForumLike =====
        modelBuilder.Entity<ForumLike>(e =>
        {
            e.ToTable("forum_likes");
            e.HasKey(fl => fl.Id);
            e.HasIndex(fl => new { fl.UserId, fl.PostId }).IsUnique().HasFilter("post_id IS NOT NULL");
            e.HasIndex(fl => new { fl.UserId, fl.CommentId }).IsUnique().HasFilter("comment_id IS NOT NULL");
            e.HasOne(fl => fl.User).WithMany(u => u.ForumLikes).HasForeignKey(fl => fl.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(fl => fl.Post).WithMany(fp => fp.Likes).HasForeignKey(fl => fl.PostId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(fl => fl.Comment).WithMany(fc => fc.Likes).HasForeignKey(fl => fl.CommentId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            var updatedAtProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "UpdatedAt");
            if (updatedAtProp != null)
                updatedAtProp.CurrentValue = DateTime.UtcNow;
        }
    }
}
