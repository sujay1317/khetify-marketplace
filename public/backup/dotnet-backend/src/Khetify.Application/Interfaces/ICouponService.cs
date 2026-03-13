using Khetify.Application.DTOs.Coupons;

namespace Khetify.Application.Interfaces;

public interface ICouponService
{
    Task<List<CouponDto>> GetAllCouponsAsync();
    Task<List<CouponDto>> GetActiveCouponsAsync();
    Task<CouponDto> CreateCouponAsync(CreateCouponDto dto);
    Task<CouponDto> UpdateCouponAsync(Guid id, UpdateCouponDto dto);
    Task DeleteCouponAsync(Guid id);
    Task<CouponValidationResult> ValidateCouponAsync(ValidateCouponDto dto);
    Task IncrementUsedCountAsync(Guid id);
}
