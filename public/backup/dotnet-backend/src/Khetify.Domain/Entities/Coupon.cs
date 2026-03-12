namespace Khetify.Domain.Entities;

public class Coupon
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "percentage";
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; } = 0;
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime ValidFrom { get; set; } = DateTime.UtcNow;
    public DateTime? ValidUntil { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
