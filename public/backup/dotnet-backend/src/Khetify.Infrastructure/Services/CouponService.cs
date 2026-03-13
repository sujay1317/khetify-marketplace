using Khetify.Application.DTOs.Coupons;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class CouponService : ICouponService
{
    private readonly KhetifyDbContext _db;

    public CouponService(KhetifyDbContext db)
    {
        _db = db;
    }

    public async Task<List<CouponDto>> GetAllCouponsAsync()
    {
        var coupons = await _db.Coupons.OrderByDescending(c => c.CreatedAt).ToListAsync();
        return coupons.Select(MapToDto).ToList();
    }

    public async Task<List<CouponDto>> GetActiveCouponsAsync()
    {
        var now = DateTime.UtcNow;
        var coupons = await _db.Coupons
            .Where(c => c.IsActive && c.ValidFrom <= now && (c.ValidUntil == null || c.ValidUntil > now))
            .ToListAsync();
        return coupons.Select(MapToDto).ToList();
    }

    public async Task<CouponDto> CreateCouponAsync(CreateCouponDto dto)
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

    public async Task<CouponDto> UpdateCouponAsync(Guid id, UpdateCouponDto dto)
    {
        var coupon = await _db.Coupons.FindAsync(id)
            ?? throw new InvalidOperationException("Coupon not found");

        if (dto.Code != null) coupon.Code = dto.Code.ToUpper();
        if (dto.DiscountType != null) coupon.DiscountType = dto.DiscountType;
        if (dto.DiscountValue.HasValue) coupon.DiscountValue = dto.DiscountValue.Value;
        if (dto.MinOrderAmount.HasValue) coupon.MinOrderAmount = dto.MinOrderAmount.Value;
        if (dto.MaxUses.HasValue) coupon.MaxUses = dto.MaxUses.Value;
        if (dto.IsActive.HasValue) coupon.IsActive = dto.IsActive.Value;
        if (dto.ValidFrom.HasValue) coupon.ValidFrom = dto.ValidFrom.Value;
        if (dto.ValidUntil.HasValue) coupon.ValidUntil = dto.ValidUntil.Value;

        await _db.SaveChangesAsync();
        return MapToDto(coupon);
    }

    public async Task DeleteCouponAsync(Guid id)
    {
        var coupon = await _db.Coupons.FindAsync(id)
            ?? throw new InvalidOperationException("Coupon not found");

        _db.Coupons.Remove(coupon);
        await _db.SaveChangesAsync();
    }

    public async Task<CouponValidationResult> ValidateCouponAsync(ValidateCouponDto dto)
    {
        var coupon = await _db.Coupons.FirstOrDefaultAsync(c => c.Code == dto.Code.ToUpper() && c.IsActive);

        if (coupon == null)
            return new CouponValidationResult(false, "Invalid coupon code", 0, null);

        var now = DateTime.UtcNow;
        if (coupon.ValidFrom > now)
            return new CouponValidationResult(false, "Coupon is not yet active", 0, null);

        if (coupon.ValidUntil.HasValue && coupon.ValidUntil < now)
            return new CouponValidationResult(false, "Coupon has expired", 0, null);

        if (coupon.MaxUses.HasValue && coupon.UsedCount >= coupon.MaxUses)
            return new CouponValidationResult(false, "Coupon usage limit reached", 0, null);

        if (dto.OrderTotal < coupon.MinOrderAmount)
            return new CouponValidationResult(false, $"Minimum order amount is ₹{coupon.MinOrderAmount}", 0, null);

        var discount = coupon.DiscountType == "percentage"
            ? dto.OrderTotal * coupon.DiscountValue / 100
            : coupon.DiscountValue;

        return new CouponValidationResult(true, "Coupon applied successfully", Math.Min(discount, dto.OrderTotal), MapToDto(coupon));
    }

    public async Task IncrementUsedCountAsync(Guid id)
    {
        var coupon = await _db.Coupons.FindAsync(id);
        if (coupon != null)
        {
            coupon.UsedCount++;
            await _db.SaveChangesAsync();
        }
    }

    private static CouponDto MapToDto(Coupon c) => new(
        c.Id, c.Code, c.DiscountType, c.DiscountValue,
        c.MinOrderAmount, c.MaxUses, c.UsedCount, c.IsActive,
        c.ValidFrom, c.ValidUntil
    );
}
