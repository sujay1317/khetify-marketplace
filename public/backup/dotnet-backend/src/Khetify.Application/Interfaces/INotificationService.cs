using Khetify.Application.DTOs.Notifications;

namespace Khetify.Application.Interfaces;

public interface INotificationService
{
    Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
    Task DeleteNotificationAsync(Guid notificationId, Guid userId);
    Task CreateNotificationAsync(CreateNotificationDto dto);
    Task CreateOrderNotificationsAsync(Guid orderId, Guid customerId, List<Guid> sellerIds);
}
