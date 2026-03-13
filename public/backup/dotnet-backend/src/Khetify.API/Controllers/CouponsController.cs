using Khetify.Application.DTOs.Coupons;
using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[Route("api/[controller]")]
public class CouponsController : BaseController
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveCoupons()
    {
        var coupons = await _couponService.GetActiveCouponsAsync();
        return Ok(coupons);
    }

    [Authorize]
    [HttpPost("validate")]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponDto dto)
    {
        var result = await _couponService.ValidateCouponAsync(dto);
        return Ok(result);
    }

    // ===== Admin =====

    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<IActionResult> GetAllCoupons()
    {
        var coupons = await _couponService.GetAllCouponsAsync();
        return Ok(coupons);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto dto)
    {
        var coupon = await _couponService.CreateCouponAsync(dto);
        return Ok(coupon);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCoupon(Guid id, [FromBody] UpdateCouponDto dto)
    {
        try
        {
            var coupon = await _couponService.UpdateCouponAsync(id, dto);
            return Ok(coupon);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCoupon(Guid id)
    {
        try
        {
            await _couponService.DeleteCouponAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
