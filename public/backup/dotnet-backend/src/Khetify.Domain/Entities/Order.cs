using Khetify.Domain.Enums;

namespace Khetify.Domain.Entities;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public decimal Total { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string PaymentMethod { get; set; } = "cod";
    public string? ShippingAddress { get; set; } // Stored as JSON string
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Customer { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<OrderTracking> Tracking { get; set; } = new List<OrderTracking>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
