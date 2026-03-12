namespace Khetify.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? SellerId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Order Order { get; set; } = null!;
    public Product? Product { get; set; }
}
