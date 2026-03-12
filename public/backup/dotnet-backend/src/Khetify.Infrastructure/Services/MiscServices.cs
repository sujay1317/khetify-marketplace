using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;
    public ReviewService(AppDbContext db) => _db = db;

    public async Task<List<ReviewDto>> GetByProductAsync(Guid productId)
    {
        return await _db.Reviews
            .Where(r => r.ProductId == productId)
            .Include(r => r.User).ThenInclude(u => u.Profile)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(r.Id, r.UserId, r.ProductId, r.Rating, r.Comment, r.CreatedAt,
                r.User.Profile != null ? r.User.Profile.FullName : null))
            .ToListAsync();
    }

    public async Task<ReviewDto> CreateAsync(Guid userId, CreateReviewDto dto)
    {
        var review = new Review { UserId = userId, ProductId = dto.ProductId, Rating = dto.Rating, Comment = dto.Comment };
        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();
        var user = await _db.Users.Include(u => u.Profile).FirstAsync(u => u.Id == userId);
        return new ReviewDto(review.Id, review.UserId, review.ProductId, review.Rating, review.Comment, review.CreatedAt, user.Profile?.FullName);
    }

    public async Task<ReviewDto> UpdateAsync(Guid reviewId, Guid userId, UpdateReviewDto dto)
    {
        var review = await _db.Reviews.FindAsync(reviewId) ?? throw new KeyNotFoundException("Review not found");
        if (review.UserId != userId) throw new UnauthorizedAccessException("Not authorized");
        if (dto.Rating.HasValue) review.Rating = dto.Rating.Value;
        if (dto.Comment != null) review.Comment = dto.Comment;
        review.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return new ReviewDto(review.Id, review.UserId, review.ProductId, review.Rating, review.Comment, review.CreatedAt, null);
    }

    public async Task DeleteAsync(Guid reviewId, Guid userId, bool isAdmin)
    {
        var review = await _db.Reviews.FindAsync(reviewId) ?? throw new KeyNotFoundException("Review not found");
        if (!isAdmin && review.UserId != userId) throw new UnauthorizedAccessException("Not authorized");
        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();
    }
}

public class WishlistService : IWishlistService
{
    private readonly AppDbContext _db;
    public WishlistService(AppDbContext db) => _db = db;

    public async Task<List<WishlistDto>> GetByUserAsync(Guid userId)
    {
        return await _db.Wishlists
            .Where(w => w.UserId == userId)
            .Include(w => w.Product).ThenInclude(p => p.Images)
            .Include(w => w.Product).ThenInclude(p => p.Reviews)
            .Include(w => w.Product).ThenInclude(p => p.Seller).ThenInclude(s => s.Profile)
            .Select(w => new WishlistDto(w.Id, w.ProductId, w.CreatedAt, new ProductDto(
                w.Product.Id, w.Product.SellerId, w.Product.Name, w.Product.NameHi,
                w.Product.Description, w.Product.DescriptionHi, w.Product.Price,
                w.Product.OriginalPrice, w.Product.Category, w.Product.Image,
                w.Product.Unit, w.Product.Stock, w.Product.IsOrganic, w.Product.IsApproved,
                w.Product.CreatedAt, w.Product.Seller.Profile != null ? w.Product.Seller.Profile.FullName : null,
                null, null, 0)))
            .ToListAsync();
    }

    public async Task<WishlistDto> AddAsync(Guid userId, AddWishlistDto dto)
    {
        var existing = await _db.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == dto.ProductId);
        if (existing != null) throw new InvalidOperationException("Already in wishlist");

        var wishlist = new Wishlist { UserId = userId, ProductId = dto.ProductId };
        _db.Wishlists.Add(wishlist);
        await _db.SaveChangesAsync();
        return new WishlistDto(wishlist.Id, wishlist.ProductId, wishlist.CreatedAt, null);
    }

    public async Task RemoveAsync(Guid userId, Guid productId)
    {
        var wishlist = await _db.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId)
            ?? throw new KeyNotFoundException("Wishlist item not found");
        _db.Wishlists.Remove(wishlist);
        await _db.SaveChangesAsync();
    }
}

public class CouponService : ICouponService
{
    private readonly AppDbContext _db;
    public CouponService(AppDbContext db) => _db = db;

    public async Task<List<CouponDto>> GetAllAsync(bool isAdmin)
    {
        var query = isAdmin ? _db.Coupons.AsQueryable() : _db.Coupons.Where(c => c.IsActive);
        return await query.Select(c => MapToDto(c)).ToListAsync();
    }

    public async Task<CouponDto> CreateAsync(CreateCouponDto dto)
    {
        var coupon = new Coupon
        {
            Code = dto.Code.ToUpper(),
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinOrderAmount = dto.MinOrderAmount,
            MaxUses = dto.MaxUses,
            ValidFrom = dto.ValidFrom ?? DateTime.UtcNow,
            ValidUntil = dto.ValidUntil
        };
        _db.Coupons.Add(coupon);
        await _db.SaveChangesAsync();
        return MapToDto(coupon);
    }

    public async Task<CouponDto> UpdateAsync(Guid couponId, UpdateCouponDto dto)
    {
        var coupon = await _db.Coupons.FindAsync(couponId) ?? throw new KeyNotFoundException("Coupon not found");
        if (dto.Code != null) coupon.Code = dto.Code.ToUpper();
        if (dto.DiscountType != null) coupon.DiscountType = dto.DiscountType;
        if (dto.DiscountValue.HasValue) coupon.DiscountValue = dto.DiscountValue.Value;
        if (dto.MinOrderAmount.HasValue) coupon.MinOrderAmount = dto.MinOrderAmount.Value;
        if (dto.MaxUses.HasValue) coupon.MaxUses = dto.MaxUses.Value;
        if (dto.IsActive.HasValue) coupon.IsActive = dto.IsActive.Value;
        if (dto.ValidFrom.HasValue) coupon.ValidFrom = dto.ValidFrom.Value;
        if (dto.ValidUntil.HasValue) coupon.ValidUntil = dto.ValidUntil.Value;
        coupon.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return MapToDto(coupon);
    }

    public async Task DeleteAsync(Guid couponId)
    {
        var coupon = await _db.Coupons.FindAsync(couponId) ?? throw new KeyNotFoundException("Coupon not found");
        _db.Coupons.Remove(coupon);
        await _db.SaveChangesAsync();
    }

    public async Task<CouponValidationResult> ValidateAsync(ValidateCouponDto dto)
    {
        var coupon = await _db.Coupons.FirstOrDefaultAsync(c => c.Code == dto.Code.ToUpper() && c.IsActive);
        if (coupon == null) return new CouponValidationResult(false, "Invalid coupon code", 0, null);
        if (coupon.ValidUntil.HasValue && coupon.ValidUntil < DateTime.UtcNow) return new CouponValidationResult(false, "Coupon expired", 0, null);
        if (dto.OrderTotal < coupon.MinOrderAmount) return new CouponValidationResult(false, $"Minimum order: ₹{coupon.MinOrderAmount}", 0, null);
        if (coupon.MaxUses.HasValue && coupon.UsedCount >= coupon.MaxUses) return new CouponValidationResult(false, "Coupon usage limit reached", 0, null);

        var discount = coupon.DiscountType == "percentage"
            ? Math.Round(dto.OrderTotal * coupon.DiscountValue / 100, 2)
            : coupon.DiscountValue;

        return new CouponValidationResult(true, null, discount, MapToDto(coupon));
    }

    private static CouponDto MapToDto(Coupon c) => new(c.Id, c.Code, c.DiscountType, c.DiscountValue, c.MinOrderAmount, c.MaxUses, c.UsedCount, c.IsActive, c.ValidFrom, c.ValidUntil);
}

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    public NotificationService(AppDbContext db) => _db = db;

    public async Task<List<NotificationDto>> GetByUserAsync(Guid userId)
    {
        return await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto(n.Id, n.Title, n.Message, n.Type, n.IsRead, n.OrderId, n.CreatedAt))
            .ToListAsync();
    }

    public async Task<NotificationDto> CreateAsync(CreateNotificationDto dto)
    {
        var notification = new Notification
        {
            UserId = dto.UserId, Title = dto.Title, Message = dto.Message, Type = dto.Type, OrderId = dto.OrderId
        };
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();
        return new NotificationDto(notification.Id, notification.Title, notification.Message, notification.Type, notification.IsRead, notification.OrderId, notification.CreatedAt);
    }

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId)
            ?? throw new KeyNotFoundException("Notification not found");
        n.IsRead = true;
        await _db.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        await _db.Notifications.Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }

    public async Task DeleteAsync(Guid notificationId, Guid userId)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId)
            ?? throw new KeyNotFoundException("Notification not found");
        _db.Notifications.Remove(n);
        await _db.SaveChangesAsync();
    }
}
