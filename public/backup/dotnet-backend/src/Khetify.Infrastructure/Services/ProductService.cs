using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Domain.Enums;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _db;

    public ProductService(AppDbContext db) => _db = db;

    public async Task<ProductDto> GetByIdAsync(Guid id, Guid? currentUserId)
    {
        var product = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Include(p => p.Seller).ThenInclude(s => s.Profile)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Product not found");

        return MapToDto(product);
    }

    public async Task<PaginatedResult<ProductDto>> GetAllAsync(
        int page, int pageSize, string? category, string? search,
        bool? isOrganic, string? sortBy, Guid? sellerId, bool includeUnapproved)
    {
        var query = _db.Products
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Include(p => p.Seller).ThenInclude(s => s.Profile)
            .AsQueryable();

        if (!includeUnapproved)
            query = query.Where(p => p.IsApproved);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()) ||
                                     (p.NameHi != null && p.NameHi.Contains(search)));

        if (isOrganic.HasValue)
            query = query.Where(p => p.IsOrganic == isOrganic.Value);

        if (sellerId.HasValue)
            query = query.Where(p => p.SellerId == sellerId.Value);

        query = sortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            "rating" => query.OrderByDescending(p => p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PaginatedResult<ProductDto>(items.Select(MapToDto).ToList(), total, page, pageSize);
    }

    public async Task<ProductDto> CreateAsync(Guid sellerId, CreateProductDto dto)
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

        return await GetByIdAsync(product.Id, null);
    }

    public async Task<ProductDto> UpdateAsync(Guid productId, Guid userId, UpdateProductDto dto, bool isAdmin)
    {
        var product = await _db.Products.FindAsync(productId)
            ?? throw new KeyNotFoundException("Product not found");

        if (!isAdmin && product.SellerId != userId)
            throw new UnauthorizedAccessException("Not authorized");

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
        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(product.Id, null);
    }

    public async Task DeleteAsync(Guid productId, Guid userId, bool isAdmin)
    {
        var product = await _db.Products.FindAsync(productId)
            ?? throw new KeyNotFoundException("Product not found");

        if (!isAdmin && product.SellerId != userId)
            throw new UnauthorizedAccessException("Not authorized");

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
    }

    public async Task<ProductDto> ApproveAsync(Guid productId)
    {
        var product = await _db.Products.FindAsync(productId)
            ?? throw new KeyNotFoundException("Product not found");

        product.IsApproved = true;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return await GetByIdAsync(product.Id, null);
    }

    public async Task<List<ProductImageDto>> GetImagesAsync(Guid productId)
    {
        return await _db.ProductImages
            .Where(pi => pi.ProductId == productId)
            .OrderBy(pi => pi.DisplayOrder)
            .Select(pi => new ProductImageDto(pi.Id, pi.ImageUrl, pi.DisplayOrder))
            .ToListAsync();
    }

    public async Task<ProductImageDto> AddImageAsync(Guid productId, Guid userId, string imageUrl, int displayOrder)
    {
        var product = await _db.Products.FindAsync(productId)
            ?? throw new KeyNotFoundException("Product not found");

        if (product.SellerId != userId)
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

    public async Task DeleteImageAsync(Guid imageId, Guid userId, bool isAdmin)
    {
        var image = await _db.ProductImages.Include(pi => pi.Product).FirstOrDefaultAsync(pi => pi.Id == imageId)
            ?? throw new KeyNotFoundException("Image not found");

        if (!isAdmin && image.Product.SellerId != userId)
            throw new UnauthorizedAccessException("Not authorized");

        _db.ProductImages.Remove(image);
        await _db.SaveChangesAsync();
    }

    private static ProductDto MapToDto(Product p)
    {
        var avgRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : (double?)null;
        var sellerName = p.Seller?.Profile?.FullName;

        return new ProductDto(
            p.Id, p.SellerId, p.Name, p.NameHi, p.Description, p.DescriptionHi,
            p.Price, p.OriginalPrice, p.Category, p.Image, p.Unit, p.Stock,
            p.IsOrganic, p.IsApproved, p.CreatedAt, sellerName,
            p.Images.Select(i => new ProductImageDto(i.Id, i.ImageUrl, i.DisplayOrder)).ToList(),
            avgRating, p.Reviews.Count
        );
    }
}
