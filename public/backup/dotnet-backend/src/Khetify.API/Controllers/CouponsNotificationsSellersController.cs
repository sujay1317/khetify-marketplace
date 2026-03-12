using System.Security.Claims;
using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;
    public CouponsController(ICouponService couponService) => _couponService = couponService;

    private bool IsAdmin => User.IsInRole("admin");

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _couponService.GetAllAsync(IsAdmin));

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCouponDto dto) => Ok(await _couponService.CreateAsync(dto));

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCouponDto dto) => Ok(await _couponService.UpdateAsync(id, dto));

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _couponService.DeleteAsync(id);
        return Ok(new { message = "Coupon deleted" });
    }

    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] ValidateCouponDto dto) => Ok(await _couponService.ValidateAsync(dto));
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    public NotificationsController(INotificationService notificationService) => _notificationService = notificationService;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _notificationService.GetByUserAsync(UserId));

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _notificationService.MarkAsReadAsync(id, UserId);
        return Ok(new { message = "Marked as read" });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync(UserId);
        return Ok(new { message = "All marked as read" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _notificationService.DeleteAsync(id, UserId);
        return Ok(new { message = "Notification deleted" });
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class SellersController : ControllerBase
{
    private readonly ISellerService _sellerService;
    public SellersController(ISellerService sellerService) => _sellerService = sellerService;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSellerDto dto)
        => Ok(await _sellerService.CreateSellerAsync(UserId, dto));

    [AllowAnonymous]
    [HttpGet("{id}/public")]
    public async Task<IActionResult> GetPublicInfo(Guid id) => Ok(await _sellerService.GetPublicInfoAsync(id));

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _sellerService.GetAllSellersAsync());
}
