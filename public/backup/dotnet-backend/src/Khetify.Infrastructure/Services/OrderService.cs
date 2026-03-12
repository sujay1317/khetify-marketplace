using System.Text.Json;
using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Domain.Enums;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notificationService;

    public OrderService(AppDbContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task<OrderDto> GetByIdAsync(Guid orderId, Guid userId, bool isAdmin)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Tracking)
            .Include(o => o.Customer).ThenInclude(c => c.Profile)
            .FirstOrDefaultAsync(o => o.Id == orderId)
            ?? throw new KeyNotFoundException("Order not found");

        if (!isAdmin && order.CustomerId != userId)
        {
            // Check if seller
            var isSeller = order.Items.Any(i => i.SellerId == userId);
            if (!isSeller) throw new UnauthorizedAccessException("Not authorized");
        }

        return MapToDto(order);
    }

    public async Task<PaginatedResult<OrderDto>> GetAllAsync(
        int page, int pageSize, Guid? customerId, Guid? sellerId, string? status, bool isAdmin)
    {
        var query = _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Tracking)
            .Include(o => o.Customer).ThenInclude(c => c.Profile)
            .AsQueryable();

        if (!isAdmin && customerId.HasValue)
            query = query.Where(o => o.CustomerId == customerId.Value);

        if (sellerId.HasValue)
            query = query.Where(o => o.Items.Any(i => i.SellerId == sellerId.Value));

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
            query = query.Where(o => o.Status == orderStatus);

        var total = await query.CountAsync();
        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();

        return new PaginatedResult<OrderDto>(orders.Select(MapToDto).ToList(), total, page, pageSize);
    }

    public async Task<OrderDto> CreateAsync(Guid customerId, CreateOrderDto dto)
    {
        var order = new Order
        {
            CustomerId = customerId,
            Total = dto.Total,
            PaymentMethod = dto.PaymentMethod,
            ShippingAddress = JsonSerializer.Serialize(dto.ShippingAddress),
            Status = OrderStatus.Pending
        };

        _db.Orders.Add(order);

        foreach (var item in dto.Items)
        {
            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = item.ProductId,
                SellerId = item.SellerId,
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                Price = item.Price
            };
            _db.OrderItems.Add(orderItem);

            // Reduce stock
            if (item.ProductId.HasValue)
            {
                var product = await _db.Products.FindAsync(item.ProductId.Value);
                if (product != null)
                {
                    product.Stock = Math.Max(0, product.Stock - item.Quantity);
                }
            }
        }

        await _db.SaveChangesAsync();

        // Create notifications for sellers
        var sellerIds = dto.Items.Where(i => i.SellerId.HasValue).Select(i => i.SellerId!.Value).Distinct();
        foreach (var sellerId in sellerIds)
        {
            await _notificationService.CreateAsync(new CreateNotificationDto(
                sellerId, "New Order", $"You have a new order #{order.Id.ToString()[..8]}", "order", order.Id
            ));
        }

        return await GetByIdAsync(order.Id, customerId, false);
    }

    public async Task<OrderDto> UpdateStatusAsync(Guid orderId, Guid userId, UpdateOrderStatusDto dto, bool isAdmin)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId)
            ?? throw new KeyNotFoundException("Order not found");

        if (!isAdmin)
        {
            var isSeller = order.Items.Any(i => i.SellerId == userId);
            if (!isSeller) throw new UnauthorizedAccessException("Not authorized");
        }

        if (Enum.TryParse<OrderStatus>(dto.Status, true, out var newStatus))
        {
            order.Status = newStatus;
            order.UpdatedAt = DateTime.UtcNow;

            // Add tracking entry
            _db.OrderTracking.Add(new OrderTracking
            {
                OrderId = orderId,
                Status = dto.Status,
                Description = $"Order status updated to {dto.Status}"
            });

            // Notify customer
            await _notificationService.CreateAsync(new CreateNotificationDto(
                order.CustomerId, "Order Update",
                $"Your order #{orderId.ToString()[..8]} status: {dto.Status}", "order", orderId
            ));

            await _db.SaveChangesAsync();
        }

        return await GetByIdAsync(orderId, userId, isAdmin);
    }

    public async Task<List<OrderTrackingDto>> GetTrackingAsync(Guid orderId, Guid userId, bool isAdmin)
    {
        return await _db.OrderTracking
            .Where(ot => ot.OrderId == orderId)
            .OrderBy(ot => ot.CreatedAt)
            .Select(ot => new OrderTrackingDto(ot.Id, ot.Status, ot.Description, ot.CreatedAt))
            .ToListAsync();
    }

    public async Task<OrderTrackingDto> AddTrackingAsync(Guid orderId, Guid userId, CreateOrderTrackingDto dto)
    {
        var tracking = new OrderTracking
        {
            OrderId = orderId,
            Status = dto.Status,
            Description = dto.Description
        };

        _db.OrderTracking.Add(tracking);
        await _db.SaveChangesAsync();

        return new OrderTrackingDto(tracking.Id, tracking.Status, tracking.Description, tracking.CreatedAt);
    }

    public async Task<PaginatedResult<OrderDto>> GetSellerOrdersAsync(Guid sellerId, int page, int pageSize, string? status)
    {
        return await GetAllAsync(page, pageSize, null, sellerId, status, false);
    }

    private static OrderDto MapToDto(Order o)
    {
        object? shippingAddr = null;
        if (o.ShippingAddress != null)
        {
            try { shippingAddr = JsonSerializer.Deserialize<object>(o.ShippingAddress); }
            catch { shippingAddr = o.ShippingAddress; }
        }

        return new OrderDto(
            o.Id, o.CustomerId, o.Total, o.Status.ToString().ToLower(),
            o.PaymentMethod, shippingAddr, o.CreatedAt,
            o.Items.Select(i => new OrderItemDto(i.Id, i.ProductId, i.SellerId, i.ProductName, i.Quantity, i.Price)).ToList(),
            o.Tracking?.Select(t => new OrderTrackingDto(t.Id, t.Status, t.Description, t.CreatedAt)).ToList(),
            o.Customer?.Profile?.FullName
        );
    }
}
