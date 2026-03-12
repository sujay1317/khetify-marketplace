using System.Security.Claims;
using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    public OrdersController(IOrderService orderService) => _orderService = orderService;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsAdmin => User.IsInRole("admin");

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null)
    {
        var customerId = IsAdmin ? (Guid?)null : UserId;
        return Ok(await _orderService.GetAllAsync(page, pageSize, customerId, null, status, IsAdmin));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id) => Ok(await _orderService.GetByIdAsync(id, UserId, IsAdmin));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
        => Ok(await _orderService.CreateAsync(UserId, dto));

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
        => Ok(await _orderService.UpdateStatusAsync(id, UserId, dto, IsAdmin));

    [HttpGet("{id}/tracking")]
    public async Task<IActionResult> GetTracking(Guid id)
        => Ok(await _orderService.GetTrackingAsync(id, UserId, IsAdmin));

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpPost("{id}/tracking")]
    public async Task<IActionResult> AddTracking(Guid id, [FromBody] CreateOrderTrackingDto dto)
        => Ok(await _orderService.AddTrackingAsync(id, UserId, dto));

    [Authorize(Policy = "SellerOnly")]
    [HttpGet("seller")]
    public async Task<IActionResult> GetSellerOrders(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null)
        => Ok(await _orderService.GetSellerOrdersAsync(UserId, page, pageSize, status));
}
