namespace Khetify.Application.DTOs.Users;

public record ProfileDto(
    Guid UserId,
    string? FullName,
    string? Phone,
    string? AvatarUrl,
    string? ShopImage,
    bool FreeDelivery,
    string? Email,
    string? Role
);

public record UpdateProfileDto(
    string? FullName,
    string? Phone,
    string? AvatarUrl,
    string? ShopImage,
    bool? FreeDelivery
);

public record CreateSellerDto(
    string Email,
    string Password,
    string FullName,
    string? Phone,
    bool FreeDelivery
);

public record AdminUserDto(
    Guid Id,
    string Email,
    string? FullName,
    string? Phone,
    string Role,
    DateTime CreatedAt
);

public record UpdateUserPasswordDto(Guid UserId, string NewPassword);
