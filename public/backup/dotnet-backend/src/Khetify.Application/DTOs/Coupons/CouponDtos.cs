namespace Khetify.Application.DTOs.Coupons;

public record CreateCouponDto(
    string Code,
    string DiscountType,
    decimal DiscountValue,
    decimal MinOrderAmount,
    int? MaxUses,
    DateTime? ValidFrom,
    DateTime? ValidUntil
);

public record UpdateCouponDto(
    string? Code,
    string? DiscountType,
    decimal? DiscountValue,
    decimal? MinOrderAmount,
    int? MaxUses,
    bool? IsActive,
    DateTime? ValidFrom,
    DateTime? ValidUntil
);

public record CouponDto(
    Guid Id,
    string Code,
    string DiscountType,
    decimal DiscountValue,
    decimal MinOrderAmount,
    int? MaxUses,
    int UsedCount,
    bool IsActive,
    DateTime ValidFrom,
    DateTime? ValidUntil
);

public record ValidateCouponDto(string Code, decimal OrderTotal);
public record CouponValidationResult(bool IsValid, string? Message, decimal DiscountAmount, CouponDto? Coupon);
