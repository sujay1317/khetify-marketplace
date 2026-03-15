using Khetify.Application.DTOs.Orders;
using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class OrdersController : BaseController
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var order = await _orderService.CreateOrderAsync(GetUserId(), dto);
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var order = await _orderService.GetOrderByIdAsync(id, GetUserId(), IsAdmin);
        return order == null ? NotFound() : Ok(order);
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var orders = await _orderService.GetCustomerOrdersAsync(GetUserId());
        return Ok(orders);
    }

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpGet("seller-orders")]
    public async Task<IActionResult> GetSellerOrders()
    {
        var orders = await _orderService.GetSellerOrdersAsync(GetUserId());
        return Ok(orders);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _orderService.GetAllOrdersAsync();
        return Ok(orders);
    }

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        try
        {
            var order = await _orderService.UpdateOrderStatusAsync(id, dto.Status, GetUserId(), IsAdmin);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpPost("{id:guid}/tracking")]
    public async Task<IActionResult> AddTracking(Guid id, [FromBody] AddTrackingDto dto)
    {
        try
        {
            var tracking = await _orderService.AddOrderTrackingAsync(id, dto, GetUserId(), IsAdmin);
            return Ok(tracking);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("seller/{sellerId:guid}/report")]
    public async Task<IActionResult> GetSellerOrderReport(Guid sellerId, [FromQuery] string? date = null)
    {
        var report = await _orderService.GetSellerOrderReportAsync(sellerId, date);
        return Ok(report);
    }
}
