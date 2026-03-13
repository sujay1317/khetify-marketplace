using Khetify.Application.DTOs.Products;
using Khetify.Application.DTOs.Common;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly KhetifyDbContext _db;

    public ProductService(KhetifyDbContext db)
    {
        _db = db;
    }

    public async Task<PaginatedResult<ProductDto>> GetProductsAsync(
        string? category, string? search, bool? isOrganic, string? sort, int page, int pageSize)
    {
        var query = _db.Products
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Include(p => p.Seller).ThenInclude(s => s.Profile)
            .Where(p => p.IsApproved);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()) ||
                                     (p.NameHi != null && p.NameHi.Contains(search)));

        if (isOrganic.HasValue)
            query = query.Where(p => p.IsOrganic == isOrganic.Value);

        query = sort switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            "rating" => query.OrderByDescending(p => p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PaginatedResult<ProductDto>(
            items.Select(MapToDto).ToList(), total, page, pageSize
        );
    }

    public async Task<ProductDto?> GetProductByIdAsync(Guid id, Guid? currentUserId = null)
    {
        var product = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Include(p => p.Seller).ThenInclude(s => s.Profile)
            .FirstOrDefaultAsync(p => p.Id == id);

        return product == null ? null : MapToDto(product);
    }

    public async Task<List<ProductDto>> GetSellerProductsAsync(Guid sellerId)
    {
        var products = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Include(p => p.Seller).ThenInclude(s => s.Profile)
            .Where(p => p.SellerId == sellerId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return products.Select(MapToDto).ToList();
    }

    public async Task<ProductDto> CreateProductAsync(Guid sellerId, CreateProductDto dto)
    {
        var product = new Product
        {
            SellerId = sellerId,
            Name = dto.Name,
            NameHi = dto.NameHi,
            Description = dto.Description,
            DescriptionHi = dto.DescriptionHi,
            Price = dto.Price,
            OriginalPrice = dto.OriginalPrice,
            Category = dto.Category,
            Image = dto.Image,
            Unit = dto.Unit,
            Stock = dto.Stock,
            IsOrganic = dto.IsOrganic,
            IsApproved = false
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        return await GetProductByIdAsync(product.Id) ?? throw new Exception("Failed to create product");
    }

    public async Task<ProductDto> UpdateProductAsync(Guid productId, Guid userId, UpdateProductDto dto, bool isAdmin)
    {
        var product = await _db.Products.FindAsync(productId)
            ?? throw new InvalidOperationException("Product not found");

        if (!isAdmin && product.SellerId != userId)
            throw new UnauthorizedAccessException("Not authorized to update this product");

        if (dto.Name != null) product.Name = dto.Name;
        if (dto.NameHi != null) product.NameHi = dto.NameHi;
        if (dto.Description != null) product.Description = dto.Description;
        if (dto.DescriptionHi != null) product.DescriptionHi = dto.DescriptionHi;
        if (dto.Price.HasValue) product.Price = dto.Price.Value;
        if (dto.OriginalPrice.HasValue) product.OriginalPrice = dto.OriginalPrice.Value;
        if (dto.Category != null) product.Category = dto.Category;
        if (dto.Image != null) product.Image = dto.Image;
        if (dto.Unit != null) product.Unit = dto.Unit;
        if (dto.Stock.HasValue) product.Stock = dto.Stock.Value;
        if (dto.IsOrganic.HasValue) product.IsOrganic = dto.IsOrganic.Value;
        if (dto.IsApproved.HasValue && isAdmin) product.IsApproved = dto.IsApproved.Value;

        await _db.SaveChangesAsync();
        return await GetProductByIdAsync(product.Id) ?? throw new Exception("Failed to update product");
    }

    public async Task DeleteProductAsync(Guid productId, Guid userId, bool isAdmin)
    {
        var product = await _db.Products.FindAsync(productId)
            ?? throw new InvalidOperationException("Product not found");

        if (!isAdmin && product.SellerId != userId)
            throw new UnauthorizedAccessException("Not authorized to delete this product");

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
    }

    public async Task<ProductDto> ApproveProductAsync(Guid productId)
    {
        var product = await _db.Products.FindAsync(productId)
            ?? throw new InvalidOperationException("Product not found");

        product.IsApproved = true;
        await _db.SaveChangesAsync();
        return await GetProductByIdAsync(product.Id) ?? throw new Exception("Failed");
    }

    public async Task<List<ProductDto>> GetPendingProductsAsync()
    {
        var products = await _db.Products
            .Include(p => p.Images).Include(p => p.Reviews)
            .Include(p => p.Seller).ThenInclude(s => s.Profile)
            .Where(p => !p.IsApproved)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return products.Select(MapToDto).ToList();
    }

    public async Task<ProductImageDto> AddProductImageAsync(Guid productId, Guid sellerId, string imageUrl, int displayOrder)
    {
        var product = await _db.Products.FindAsync(productId)
            ?? throw new InvalidOperationException("Product not found");

        if (product.SellerId != sellerId)
            throw new UnauthorizedAccessException("Not authorized");

        var image = new ProductImage
        {
            ProductId = productId,
            ImageUrl = imageUrl,
            DisplayOrder = displayOrder
        };

        _db.ProductImages.Add(image);
        await _db.SaveChangesAsync();

        return new ProductImageDto(image.Id, image.ImageUrl, image.DisplayOrder);
    }

    public async Task DeleteProductImageAsync(Guid imageId, Guid sellerId, bool isAdmin)
    {
        var image = await _db.ProductImages.Include(pi => pi.Product).FirstOrDefaultAsync(pi => pi.Id == imageId)
            ?? throw new InvalidOperationException("Image not found");

        if (!isAdmin && image.Product.SellerId != sellerId)
            throw new UnauthorizedAccessException("Not authorized");

        _db.ProductImages.Remove(image);
        await _db.SaveChangesAsync();
    }

    private static ProductDto MapToDto(Product p) => new(
        p.Id, p.SellerId, p.Name, p.NameHi, p.Description, p.DescriptionHi,
        p.Price, p.OriginalPrice, p.Category, p.Image, p.Unit, p.Stock,
        p.IsOrganic, p.IsApproved,
        p.Seller?.Profile?.FullName,
        p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,
        p.Reviews.Count,
        p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto(i.Id, i.ImageUrl, i.DisplayOrder)).ToList(),
        p.CreatedAt
    );
}
