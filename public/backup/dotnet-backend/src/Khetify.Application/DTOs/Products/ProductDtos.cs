namespace Khetify.Application.DTOs.Products;

public record CreateProductDto(
    string Name,
    string? NameHi,
    string? Description,
    string? DescriptionHi,
    decimal Price,
    decimal? OriginalPrice,
    string Category,
    string? Image,
    string Unit,
    int Stock,
    bool IsOrganic
);

public record UpdateProductDto(
    string? Name,
    string? NameHi,
    string? Description,
    string? DescriptionHi,
    decimal? Price,
    decimal? OriginalPrice,
    string? Category,
    string? Image,
    string? Unit,
    int? Stock,
    bool? IsOrganic,
    bool? IsApproved
);

public record ProductDto(
    Guid Id,
    Guid SellerId,
    string Name,
    string? NameHi,
    string? Description,
    string? DescriptionHi,
    decimal Price,
    decimal? OriginalPrice,
    string Category,
    string? Image,
    string Unit,
    int Stock,
    bool IsOrganic,
    bool IsApproved,
    string? SellerName,
    double AverageRating,
    int ReviewCount,
    List<ProductImageDto> Images,
    DateTime CreatedAt
);

public record ProductImageDto(Guid Id, string ImageUrl, int DisplayOrder);
