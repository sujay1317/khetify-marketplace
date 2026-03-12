using Khetify.Application.DTOs;

namespace Khetify.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
}

public interface IUserService
{
    Task<UserDto> GetByIdAsync(Guid id);
    Task<PaginatedResult<UserListDto>> GetAllUsersAsync(int page, int pageSize, string? role);
    Task<ProfileDto> GetProfileAsync(Guid userId);
    Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task AdminUpdatePasswordAsync(Guid adminId, AdminUpdatePasswordDto dto);
    Task AdminDeleteUserAsync(Guid adminId, AdminDeleteUserDto dto);
}

public interface IProductService
{
    Task<ProductDto> GetByIdAsync(Guid id, Guid? currentUserId);
    Task<PaginatedResult<ProductDto>> GetAllAsync(int page, int pageSize, string? category, string? search, bool? isOrganic, string? sortBy, Guid? sellerId, bool includeUnapproved = false);
    Task<ProductDto> CreateAsync(Guid sellerId, CreateProductDto dto);
    Task<ProductDto> UpdateAsync(Guid productId, Guid userId, UpdateProductDto dto, bool isAdmin);
    Task DeleteAsync(Guid productId, Guid userId, bool isAdmin);
    Task<ProductDto> ApproveAsync(Guid productId);
    Task<List<ProductImageDto>> GetImagesAsync(Guid productId);
    Task<ProductImageDto> AddImageAsync(Guid productId, Guid userId, string imageUrl, int displayOrder);
    Task DeleteImageAsync(Guid imageId, Guid userId, bool isAdmin);
}

public interface IOrderService
{
    Task<OrderDto> GetByIdAsync(Guid orderId, Guid userId, bool isAdmin);
    Task<PaginatedResult<OrderDto>> GetAllAsync(int page, int pageSize, Guid? customerId, Guid? sellerId, string? status, bool isAdmin);
    Task<OrderDto> CreateAsync(Guid customerId, CreateOrderDto dto);
    Task<OrderDto> UpdateStatusAsync(Guid orderId, Guid userId, UpdateOrderStatusDto dto, bool isAdmin);
    Task<List<OrderTrackingDto>> GetTrackingAsync(Guid orderId, Guid userId, bool isAdmin);
    Task<OrderTrackingDto> AddTrackingAsync(Guid orderId, Guid userId, CreateOrderTrackingDto dto);
    Task<PaginatedResult<OrderDto>> GetSellerOrdersAsync(Guid sellerId, int page, int pageSize, string? status);
}

public interface IReviewService
{
    Task<List<ReviewDto>> GetByProductAsync(Guid productId);
    Task<ReviewDto> CreateAsync(Guid userId, CreateReviewDto dto);
    Task<ReviewDto> UpdateAsync(Guid reviewId, Guid userId, UpdateReviewDto dto);
    Task DeleteAsync(Guid reviewId, Guid userId, bool isAdmin);
}

public interface IWishlistService
{
    Task<List<WishlistDto>> GetByUserAsync(Guid userId);
    Task<WishlistDto> AddAsync(Guid userId, AddWishlistDto dto);
    Task RemoveAsync(Guid userId, Guid productId);
}

public interface ICouponService
{
    Task<List<CouponDto>> GetAllAsync(bool isAdmin);
    Task<CouponDto> CreateAsync(CreateCouponDto dto);
    Task<CouponDto> UpdateAsync(Guid couponId, UpdateCouponDto dto);
    Task DeleteAsync(Guid couponId);
    Task<CouponValidationResult> ValidateAsync(ValidateCouponDto dto);
}

public interface INotificationService
{
    Task<List<NotificationDto>> GetByUserAsync(Guid userId);
    Task<NotificationDto> CreateAsync(CreateNotificationDto dto);
    Task MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
    Task DeleteAsync(Guid notificationId, Guid userId);
}

public interface IForumService
{
    Task<PaginatedResult<ForumPostDto>> GetPostsAsync(int page, int pageSize, string? category, Guid? currentUserId);
    Task<ForumPostDto> GetPostByIdAsync(Guid postId, Guid? currentUserId);
    Task<ForumPostDto> CreatePostAsync(Guid userId, CreateForumPostDto dto);
    Task<ForumPostDto> UpdatePostAsync(Guid postId, Guid userId, UpdateForumPostDto dto, bool isAdmin);
    Task DeletePostAsync(Guid postId, Guid userId, bool isAdmin);
    Task<List<ForumCommentDto>> GetCommentsAsync(Guid postId);
    Task<ForumCommentDto> CreateCommentAsync(Guid userId, Guid postId, CreateForumCommentDto dto);
    Task DeleteCommentAsync(Guid commentId, Guid userId, bool isAdmin);
    Task ToggleLikePostAsync(Guid userId, Guid postId);
    Task ToggleLikeCommentAsync(Guid userId, Guid commentId);
    Task TogglePinAsync(Guid postId);
}

public interface ISellerService
{
    Task<UserDto> CreateSellerAsync(Guid adminId, CreateSellerDto dto);
    Task<SellerPublicInfoDto> GetPublicInfoAsync(Guid sellerId);
    Task<List<SellerPublicInfoDto>> GetAllSellersAsync();
}

public interface IFileStorageService
{
    Task<string> UploadAsync(Stream file, string fileName, string folder);
    Task DeleteAsync(string fileUrl);
}

public interface ITokenService
{
    string GenerateAccessToken(Guid userId, string email, string role);
    string GenerateRefreshToken();
}
