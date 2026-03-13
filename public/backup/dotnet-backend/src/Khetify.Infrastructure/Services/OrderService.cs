using Khetify.Application.DTOs.Orders;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly KhetifyDbContext _db;
    private readonly INotificationService _notifications;

    public OrderService(KhetifyDbContext db, INotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    public async Task<OrderDto> CreateOrderAsync(Guid customerId, CreateOrderDto dto)
    {
        var order = new Order
        {
            CustomerId = customerId,
            Total = dto.Total,
            PaymentMethod = dto.PaymentMethod,
            ShippingAddress = dto.ShippingAddress,
            Status = "pending"
        };

        _db.Orders.Add(order);

        var sellerIds = new HashSet<Guid>();

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

            if (item.SellerId.HasValue)
                sellerIds.Add(item.SellerId.Value);

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

        // Add initial tracking
        _db.OrderTracking.Add(new OrderTracking
        {
            OrderId = order.Id,
            Status = "pending",
            Description = "Order placed successfully"
        });

        await _db.SaveChangesAsync();

        // Send notifications
        await _notifications.CreateOrderNotificationsAsync(order.Id, customerId, sellerIds.ToList());

        return await GetOrderByIdAsync(order.Id, customerId, false)
            ?? throw new Exception("Failed to create order");
    }

    public async Task<OrderDto?> GetOrderByIdAsync(Guid orderId, Guid userId, bool isAdmin)
    {
        var query = _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Tracking)
            .Include(o => o.Customer).ThenInclude(c => c.Profile)
            .AsQueryable();

        var order = await query.FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null) return null;

        // Authorization check
        if (!isAdmin && order.CustomerId != userId)
        {
            var isSellerOfOrder = await _db.OrderItems.AnyAsync(oi => oi.OrderId == orderId && oi.SellerId == userId);
            if (!isSellerOfOrder) return null;
        }

        return MapToDto(order);
    }

    public async Task<List<OrderDto>> GetCustomerOrdersAsync(Guid customerId)
    {
        var orders = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Tracking)
            .Include(o => o.Customer).ThenInclude(c => c.Profile)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(MapToDto).ToList();
    }

    public async Task<List<OrderDto>> GetSellerOrdersAsync(Guid sellerId)
    {
        var orderIds = await _db.OrderItems
            .Where(oi => oi.SellerId == sellerId)
            .Select(oi => oi.OrderId)
            .Distinct()
            .ToListAsync();

        var orders = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Tracking)
            .Include(o => o.Customer).ThenInclude(c => c.Profile)
            .Where(o => orderIds.Contains(o.Id))
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(MapToDto).ToList();
    }

    public async Task<List<OrderDto>> GetAllOrdersAsync()
    {
        var orders = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Tracking)
            .Include(o => o.Customer).ThenInclude(c => c.Profile)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(MapToDto).ToList();
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, string status, Guid userId, bool isAdmin)
    {
        var order = await _db.Orders.FindAsync(orderId)
            ?? throw new InvalidOperationException("Order not found");

        if (!isAdmin)
        {
            var isSellerOfOrder = await _db.OrderItems.AnyAsync(oi => oi.OrderId == orderId && oi.SellerId == userId);
            if (!isSellerOfOrder)
                throw new UnauthorizedAccessException("Not authorized");
        }

        order.Status = status;

        _db.OrderTracking.Add(new OrderTracking
        {
            OrderId = orderId,
            Status = status,
            Description = $"Order status updated to {status}"
        });

        await _db.SaveChangesAsync();

        return await GetOrderByIdAsync(orderId, userId, isAdmin)
            ?? throw new Exception("Failed to update order");
    }

    public async Task<OrderTrackingDto> AddOrderTrackingAsync(Guid orderId, AddTrackingDto dto, Guid userId, bool isAdmin)
    {
        if (!isAdmin)
        {
            var isSellerOfOrder = await _db.OrderItems.AnyAsync(oi => oi.OrderId == orderId && oi.SellerId == userId);
            if (!isSellerOfOrder)
                throw new UnauthorizedAccessException("Not authorized");
        }

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

    private static OrderDto MapToDto(Order o) => new(
        o.Id, o.CustomerId,
        o.Customer?.Profile?.FullName,
        o.Total, o.Status ?? "pending", o.PaymentMethod ?? "cod",
        o.ShippingAddress,
        o.Items.Select(i => new OrderItemDto(i.Id, i.ProductId, i.SellerId, i.ProductName, i.Quantity, i.Price)).ToList(),
        o.Tracking.OrderBy(t => t.CreatedAt).Select(t => new OrderTrackingDto(t.Id, t.Status, t.Description, t.CreatedAt)).ToList(),
        o.CreatedAt, o.UpdatedAt
    );
}
