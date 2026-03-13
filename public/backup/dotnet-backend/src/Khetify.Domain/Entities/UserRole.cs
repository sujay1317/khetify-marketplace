using Khetify.Domain.Enums;

namespace Khetify.Domain.Entities;

public class UserRole
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public AppRole Role { get; set; } = AppRole.Customer;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
}
