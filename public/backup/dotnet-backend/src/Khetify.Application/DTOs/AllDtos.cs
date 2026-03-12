using Khetify.Domain.Enums;

namespace Khetify.Application.DTOs;

// ==================== AUTH ====================
public record RegisterDto(string Email, string Password, string FullName, string? Phone);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string RefreshToken, UserDto User);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);

// ==================== USER ====================
public record UserDto(Guid Id, string Email, string Role, ProfileDto? Profile);
public record UserListDto(Guid Id, string Email, string Role, string? FullName, string? Phone, DateTime CreatedAt);

// ==================== PROFILE ====================
public record ProfileDto(Guid Id, Guid UserId, string? FullName, string? Phone, string? AvatarUrl, string? ShopImage, bool FreeDelivery);
public record UpdateProfileDto(string? FullName, string? Phone, string? AvatarUrl, string? ShopImage, bool? FreeDelivery);

// ==================== PRODUCT ====================
public record ProductDto(
    Guid Id, Guid SellerId, string Name, string? NameHi,
    string? Description, string? DescriptionHi, decimal Price,
    decimal? OriginalPrice, string Category, string? Image,
    string Unit, int Stock, bool IsOrganic, bool IsApproved,
    DateTime CreatedAt, string? SellerName,
    List<ProductImageDto>? Images, double? AverageRating, int ReviewCount);

public record CreateProductDto(
    string Name, string? NameHi, string? Description, string? DescriptionHi,
    decimal Price, decimal? OriginalPrice, string Category,
    string? Image, string Unit, int Stock, bool IsOrganic);

public record UpdateProductDto(
    string? Name, string? NameHi, string? Description, string? DescriptionHi,
    decimal? Price, decimal? OriginalPrice, string? Category,
    string? Image, string? Unit, int? Stock, bool? IsOrganic, bool? IsApproved);

public record ProductImageDto(Guid Id, string ImageUrl, int DisplayOrder);

// ==================== ORDER ====================
public record OrderDto(
    Guid Id, Guid CustomerId, decimal Total, string Status,
    string PaymentMethod, object? ShippingAddress,
    DateTime CreatedAt, List<OrderItemDto> Items,
    List<OrderTrackingDto>? Tracking, string? CustomerName);

public record CreateOrderDto(
    decimal Total, string PaymentMethod, object ShippingAddress,
    List<CreateOrderItemDto> Items);

public record CreateOrderItemDto(Guid? ProductId, Guid? SellerId, string ProductName, int Quantity, decimal Price);

public record OrderItemDto(Guid Id, Guid? ProductId, Guid? SellerId, string ProductName, int Quantity, decimal Price);

public record UpdateOrderStatusDto(string Status);

public record OrderTrackingDto(Guid Id, string Status, string? Description, DateTime CreatedAt);
public record CreateOrderTrackingDto(string Status, string? Description);

// ==================== REVIEW ====================
public record ReviewDto(Guid Id, Guid UserId, Guid ProductId, int Rating, string? Comment, DateTime CreatedAt, string? UserName);
public record CreateReviewDto(Guid ProductId, int Rating, string? Comment);
public record UpdateReviewDto(int? Rating, string? Comment);

// ==================== WISHLIST ====================
public record WishlistDto(Guid Id, Guid ProductId, DateTime CreatedAt, ProductDto? Product);
public record AddWishlistDto(Guid ProductId);

// ==================== COUPON ====================
public record CouponDto(
    Guid Id, string Code, string DiscountType, decimal DiscountValue,
    decimal MinOrderAmount, int? MaxUses, int UsedCount, bool IsActive,
    DateTime ValidFrom, DateTime? ValidUntil);

public record CreateCouponDto(
    string Code, string DiscountType, decimal DiscountValue,
    decimal MinOrderAmount, int? MaxUses,
    DateTime? ValidFrom, DateTime? ValidUntil);

public record UpdateCouponDto(
    string? Code, string? DiscountType, decimal? DiscountValue,
    decimal? MinOrderAmount, int? MaxUses, bool? IsActive,
    DateTime? ValidFrom, DateTime? ValidUntil);

public record ValidateCouponDto(string Code, decimal OrderTotal);
public record CouponValidationResult(bool IsValid, string? Message, decimal DiscountAmount, CouponDto? Coupon);

// ==================== NOTIFICATION ====================
public record NotificationDto(Guid Id, string Title, string Message, string Type, bool IsRead, Guid? OrderId, DateTime CreatedAt);
public record CreateNotificationDto(Guid UserId, string Title, string Message, string Type, Guid? OrderId);

// ==================== FORUM ====================
public record ForumPostDto(
    Guid Id, Guid UserId, string Title, string Content, string Category,
    int LikesCount, int CommentsCount, bool IsPinned, DateTime CreatedAt,
    string? UserName, bool IsLikedByCurrentUser);

public record CreateForumPostDto(string Title, string Content, string Category);
public record UpdateForumPostDto(string? Title, string? Content, string? Category);

public record ForumCommentDto(Guid Id, Guid PostId, Guid UserId, string Content, int LikesCount, DateTime CreatedAt, string? UserName);
public record CreateForumCommentDto(string Content);

// ==================== SELLER ====================
public record CreateSellerDto(string Email, string Password, string FullName, string? Phone, bool FreeDelivery);
public record SellerPublicInfoDto(Guid UserId, string FullName, string? ShopImage, bool FreeDelivery);

// ==================== ADMIN ====================
public record AdminUpdatePasswordDto(Guid UserId, string NewPassword);
public record AdminDeleteUserDto(Guid UserId);

// ==================== PAGINATION ====================
public record PaginatedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);
