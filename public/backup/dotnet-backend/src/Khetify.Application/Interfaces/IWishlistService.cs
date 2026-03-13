using Khetify.Application.DTOs.Wishlists;

namespace Khetify.Application.Interfaces;

public interface IWishlistService
{
    Task<List<WishlistItemDto>> GetWishlistAsync(Guid userId);
    Task<WishlistItemDto> AddToWishlistAsync(Guid userId, Guid productId);
    Task RemoveFromWishlistAsync(Guid userId, Guid productId);
}
