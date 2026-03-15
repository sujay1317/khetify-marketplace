using System.Text.Json;

namespace Khetify.Application.DTOs.Orders;

public record CreateOrderDto(
    decimal Total,
    string PaymentMethod,
    JsonDocument? ShippingAddress,
    List<CreateOrderItemDto> Items
);

public record CreateOrderItemDto(
    Guid? ProductId,
    Guid? SellerId,
    string ProductName,
    int Quantity,
    decimal Price
);

public record UpdateOrderStatusDto(string Status);

public record OrderDto(
    Guid Id,
    Guid CustomerId,
    string? CustomerName,
    decimal Total,
    string Status,
    string PaymentMethod,
    JsonDocument? ShippingAddress,
    List<OrderItemDto> Items,
    List<OrderTrackingDto> Tracking,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record OrderItemDto(
    Guid Id,
    Guid? ProductId,
    Guid? SellerId,
    string ProductName,
    int Quantity,
    decimal Price
);

public record OrderTrackingDto(Guid Id, string Status, string? Description, DateTime CreatedAt);

public record AddTrackingDto(string Status, string? Description);

public record SellerOrderReportDto(
    int TotalOrders,
    decimal TotalRevenue,
    List<DailyReportDto> DailyReports
);

public record DailyReportDto(
    string Date,
    int OrderCount,
    decimal TotalRevenue,
    List<SellerReportOrderDto> Orders
);

public record SellerReportOrderDto(
    Guid Id,
    string CustomerName,
    decimal Total,
    string Status,
    string PaymentMethod,
    DateTime CreatedAt,
    List<OrderItemDto> Items
);
