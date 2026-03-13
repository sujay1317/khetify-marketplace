using Khetify.Application.DTOs.Notifications;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly KhetifyDbContext _db;

    public NotificationService(KhetifyDbContext db)
    {
        _db = db;
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId)
    {
        var notifications = await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        return notifications.Select(n => new NotificationDto(
            n.Id, n.Title, n.Message, n.Type, n.OrderId, n.IsRead, n.CreatedAt
        )).ToList();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification != null)
        {
            notification.IsRead = true;
            await _db.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var unread = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in unread) n.IsRead = true;
        await _db.SaveChangesAsync();
    }

    public async Task DeleteNotificationAsync(Guid notificationId, Guid userId)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification != null)
        {
            _db.Notifications.Remove(notification);
            await _db.SaveChangesAsync();
        }
    }

    public async Task CreateNotificationAsync(CreateNotificationDto dto)
    {
        _db.Notifications.Add(new Notification
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            OrderId = dto.OrderId
        });
        await _db.SaveChangesAsync();
    }

    public async Task CreateOrderNotificationsAsync(Guid orderId, Guid customerId, List<Guid> sellerIds)
    {
        // Notify customer
        _db.Notifications.Add(new Notification
        {
            UserId = customerId,
            OrderId = orderId,
            Title = "Order Placed",
            Message = "Your order has been placed successfully!",
            Type = "order"
        });

        // Notify sellers
        foreach (var sellerId in sellerIds)
        {
            _db.Notifications.Add(new Notification
            {
                UserId = sellerId,
                OrderId = orderId,
                Title = "New Order Received",
                Message = "You have received a new order!",
                Type = "order"
            });
        }

        await _db.SaveChangesAsync();
    }
}
