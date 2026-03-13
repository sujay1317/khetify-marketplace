using Khetify.Application.DTOs.Users;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Domain.Enums;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly KhetifyDbContext _db;

    public UserService(KhetifyDbContext db)
    {
        _db = db;
    }

    public async Task<ProfileDto?> GetProfileAsync(Guid userId)
    {
        var user = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.UserRole)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        return new ProfileDto(
            user.Id, user.Profile?.FullName, user.Profile?.Phone,
            user.Profile?.AvatarUrl, user.Profile?.ShopImage,
            user.Profile?.FreeDelivery ?? false,
            user.Email, user.UserRole?.Role.ToString().ToLower()
        );
    }

    public async Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId)
            ?? throw new InvalidOperationException("Profile not found");

        if (dto.FullName != null) profile.FullName = dto.FullName;
        if (dto.Phone != null) profile.Phone = dto.Phone;
        if (dto.AvatarUrl != null) profile.AvatarUrl = dto.AvatarUrl;
        if (dto.ShopImage != null) profile.ShopImage = dto.ShopImage;
        if (dto.FreeDelivery.HasValue) profile.FreeDelivery = dto.FreeDelivery.Value;

        await _db.SaveChangesAsync();
        return await GetProfileAsync(userId) ?? throw new Exception("Failed");
    }

    public async Task<List<AdminUserDto>> GetAllUsersAsync()
    {
        var users = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.UserRole)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        return users.Select(u => new AdminUserDto(
            u.Id, u.Email, u.Profile?.FullName, u.Profile?.Phone,
            u.UserRole?.Role.ToString().ToLower() ?? "customer",
            u.CreatedAt
        )).ToList();
    }

    public async Task<AdminUserDto> CreateSellerAsync(CreateSellerDto dto)
    {
        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (existingUser != null)
        {
            // Convert existing user to seller
            var existingRole = await _db.UserRoles.FirstOrDefaultAsync(r => r.UserId == existingUser.Id);
            if (existingRole != null)
                existingRole.Role = AppRole.Seller;
            else
                _db.UserRoles.Add(new UserRole { UserId = existingUser.Id, Role = AppRole.Seller });

            var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == existingUser.Id);
            if (profile != null)
            {
                profile.FullName = dto.FullName;
                profile.Phone = dto.Phone;
                profile.FreeDelivery = dto.FreeDelivery;
            }

            existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            await _db.SaveChangesAsync();

            return new AdminUserDto(existingUser.Id, existingUser.Email, dto.FullName, dto.Phone, "seller", existingUser.CreatedAt);
        }

        // Create new user
        var user = new User
        {
            Email = dto.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Users.Add(user);
        _db.Profiles.Add(new Profile
        {
            UserId = user.Id,
            FullName = dto.FullName,
            Phone = dto.Phone,
            FreeDelivery = dto.FreeDelivery
        });
        _db.UserRoles.Add(new UserRole { UserId = user.Id, Role = AppRole.Seller });

        await _db.SaveChangesAsync();

        return new AdminUserDto(user.Id, user.Email, dto.FullName, dto.Phone, "seller", user.CreatedAt);
    }

    public async Task UpdateUserPasswordAsync(Guid adminId, UpdateUserPasswordDto dto)
    {
        var user = await _db.Users.FindAsync(dto.UserId)
            ?? throw new InvalidOperationException("User not found");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteUserAsync(Guid adminId, Guid targetUserId)
    {
        if (adminId == targetUserId)
            throw new InvalidOperationException("Cannot delete your own account");

        var targetRole = await _db.UserRoles.FirstOrDefaultAsync(r => r.UserId == targetUserId);
        if (targetRole?.Role == AppRole.Admin)
            throw new InvalidOperationException("Cannot delete admin accounts");

        var user = await _db.Users.FindAsync(targetUserId)
            ?? throw new InvalidOperationException("User not found");

        _db.Users.Remove(user); // Cascade deletes handle related data
        await _db.SaveChangesAsync();
    }

    public async Task<ProfileDto?> GetSellerPublicInfoAsync(Guid sellerId)
    {
        var user = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.UserRole)
            .FirstOrDefaultAsync(u => u.Id == sellerId && u.UserRole!.Role == AppRole.Seller);

        if (user?.Profile == null) return null;

        return new ProfileDto(
            user.Id, user.Profile.FullName, null, null,
            user.Profile.ShopImage, user.Profile.FreeDelivery,
            null, "seller"
        );
    }

    public async Task<List<ProfileDto>> GetAllSellersAsync()
    {
        var sellers = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.UserRole)
            .Where(u => u.UserRole!.Role == AppRole.Seller)
            .ToListAsync();

        return sellers.Select(u => new ProfileDto(
            u.Id, u.Profile?.FullName, null, null,
            u.Profile?.ShopImage, u.Profile?.FreeDelivery ?? false,
            null, "seller"
        )).ToList();
    }
}
