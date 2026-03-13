using Khetify.Application.DTOs.Wishlists;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class WishlistService : IWishlistService
{
    private readonly KhetifyDbContext _db;

    public WishlistService(KhetifyDbContext db)
    {
        _db = db;
    }

    public async Task<List<WishlistItemDto>> GetWishlistAsync(Guid userId)
    {
        var items = await _db.Wishlists
            .Include(w => w.Product)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();

        return items.Select(w => new WishlistItemDto(
            w.Id, w.ProductId, w.Product.Name, w.Product.Price, w.Product.Image, w.CreatedAt
        )).ToList();
    }

    public async Task<WishlistItemDto> AddToWishlistAsync(Guid userId, Guid productId)
    {
        var existing = await _db.Wishlists.AnyAsync(w => w.UserId == userId && w.ProductId == productId);
        if (existing) throw new InvalidOperationException("Product already in wishlist");

        var product = await _db.Products.FindAsync(productId)
            ?? throw new InvalidOperationException("Product not found");

        var wishlist = new Wishlist { UserId = userId, ProductId = productId };
        _db.Wishlists.Add(wishlist);
        await _db.SaveChangesAsync();

        return new WishlistItemDto(wishlist.Id, productId, product.Name, product.Price, product.Image, wishlist.CreatedAt);
    }

    public async Task RemoveFromWishlistAsync(Guid userId, Guid productId)
    {
        var item = await _db.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId)
            ?? throw new InvalidOperationException("Item not in wishlist");

        _db.Wishlists.Remove(item);
        await _db.SaveChangesAsync();
    }
}
