using Khetify.Application.DTOs.Orders;

namespace Khetify.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(Guid customerId, CreateOrderDto dto);
    Task<OrderDto?> GetOrderByIdAsync(Guid orderId, Guid userId, bool isAdmin);
    Task<List<OrderDto>> GetCustomerOrdersAsync(Guid customerId);
    Task<List<OrderDto>> GetSellerOrdersAsync(Guid sellerId);
    Task<List<OrderDto>> GetAllOrdersAsync();
    Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, string status, Guid userId, bool isAdmin);
    Task<OrderTrackingDto> AddOrderTrackingAsync(Guid orderId, AddTrackingDto dto, Guid userId, bool isAdmin);
}
