using Khetify.Application.DTOs.Reviews;

namespace Khetify.Application.Interfaces;

public interface IReviewService
{
    Task<List<ReviewDto>> GetProductReviewsAsync(Guid productId);
    Task<ReviewDto> CreateReviewAsync(Guid userId, CreateReviewDto dto);
    Task<ReviewDto> UpdateReviewAsync(Guid reviewId, Guid userId, UpdateReviewDto dto);
    Task DeleteReviewAsync(Guid reviewId, Guid userId);
}
