namespace Khetify.Application.DTOs.Reviews;

public record CreateReviewDto(Guid ProductId, int Rating, string? Comment);
public record UpdateReviewDto(int? Rating, string? Comment);
public record ReviewDto(Guid Id, Guid UserId, string? UserName, Guid ProductId, int Rating, string? Comment, DateTime CreatedAt);
