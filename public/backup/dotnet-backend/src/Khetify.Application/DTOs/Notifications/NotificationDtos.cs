namespace Khetify.Application.DTOs.Notifications;

public record NotificationDto(Guid Id, string Title, string Message, string Type, Guid? OrderId, bool IsRead, DateTime CreatedAt);
public record CreateNotificationDto(Guid UserId, string Title, string Message, string Type, Guid? OrderId);
