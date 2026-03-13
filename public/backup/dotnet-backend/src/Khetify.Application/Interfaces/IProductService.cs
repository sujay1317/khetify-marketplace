using Khetify.Application.DTOs.Products;
using Khetify.Application.DTOs.Common;

namespace Khetify.Application.Interfaces;

public interface IProductService
{
    Task<PaginatedResult<ProductDto>> GetProductsAsync(string? category, string? search, bool? isOrganic, string? sort, int page, int pageSize);
    Task<ProductDto?> GetProductByIdAsync(Guid id, Guid? currentUserId = null);
    Task<List<ProductDto>> GetSellerProductsAsync(Guid sellerId);
    Task<ProductDto> CreateProductAsync(Guid sellerId, CreateProductDto dto);
    Task<ProductDto> UpdateProductAsync(Guid productId, Guid userId, UpdateProductDto dto, bool isAdmin);
    Task DeleteProductAsync(Guid productId, Guid userId, bool isAdmin);
    Task<ProductDto> ApproveProductAsync(Guid productId);
    Task<List<ProductDto>> GetPendingProductsAsync();
    // Product images
    Task<ProductImageDto> AddProductImageAsync(Guid productId, Guid sellerId, string imageUrl, int displayOrder);
    Task DeleteProductImageAsync(Guid imageId, Guid sellerId, bool isAdmin);
}
