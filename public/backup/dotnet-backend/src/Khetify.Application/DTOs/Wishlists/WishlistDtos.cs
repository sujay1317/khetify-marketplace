namespace Khetify.Application.DTOs.Wishlists;

public record WishlistItemDto(Guid Id, Guid ProductId, string ProductName, decimal Price, string? Image, DateTime CreatedAt);
