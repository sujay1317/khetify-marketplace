using Khetify.Application.DTOs.Users;

namespace Khetify.Application.Interfaces;

public interface IUserService
{
    Task<ProfileDto?> GetProfileAsync(Guid userId);
    Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<List<AdminUserDto>> GetAllUsersAsync();
    Task<AdminUserDto> CreateSellerAsync(CreateSellerDto dto);
    Task UpdateUserPasswordAsync(Guid adminId, UpdateUserPasswordDto dto);
    Task DeleteUserAsync(Guid adminId, Guid targetUserId);
    Task<ProfileDto?> GetSellerPublicInfoAsync(Guid sellerId);
    Task<List<ProfileDto>> GetAllSellersAsync();
}
