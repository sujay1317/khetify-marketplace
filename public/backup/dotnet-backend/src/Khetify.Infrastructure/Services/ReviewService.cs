using Khetify.Application.DTOs.Reviews;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly KhetifyDbContext _db;

    public ReviewService(KhetifyDbContext db)
    {
        _db = db;
    }

    public async Task<List<ReviewDto>> GetProductReviewsAsync(Guid productId)
    {
        var reviews = await _db.Reviews
            .Include(r => r.User).ThenInclude(u => u.Profile)
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => new ReviewDto(
            r.Id, r.UserId, r.User?.Profile?.FullName,
            r.ProductId, r.Rating, r.Comment, r.CreatedAt
        )).ToList();
    }

    public async Task<ReviewDto> CreateReviewAsync(Guid userId, CreateReviewDto dto)
    {
        var existing = await _db.Reviews.AnyAsync(r => r.UserId == userId && r.ProductId == dto.ProductId);
        if (existing) throw new InvalidOperationException("You have already reviewed this product");

        var review = new Review
        {
            UserId = userId,
            ProductId = dto.ProductId,
            Rating = dto.Rating,
            Comment = dto.Comment
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        var user = await _db.Users.Include(u => u.Profile).FirstAsync(u => u.Id == userId);
        return new ReviewDto(review.Id, userId, user.Profile?.FullName, dto.ProductId, dto.Rating, dto.Comment, review.CreatedAt);
    }

    public async Task<ReviewDto> UpdateReviewAsync(Guid reviewId, Guid userId, UpdateReviewDto dto)
    {
        var review = await _db.Reviews.Include(r => r.User).ThenInclude(u => u.Profile)
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId)
            ?? throw new InvalidOperationException("Review not found");

        if (dto.Rating.HasValue) review.Rating = dto.Rating.Value;
        if (dto.Comment != null) review.Comment = dto.Comment;

        await _db.SaveChangesAsync();

        return new ReviewDto(review.Id, review.UserId, review.User?.Profile?.FullName,
            review.ProductId, review.Rating, review.Comment, review.CreatedAt);
    }

    public async Task DeleteReviewAsync(Guid reviewId, Guid userId)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId)
            ?? throw new InvalidOperationException("Review not found");

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();
    }
}
