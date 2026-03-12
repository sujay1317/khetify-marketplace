using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Khetify.Domain.Enums;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserDto> GetByIdAsync(Guid id)
    {
        var user = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.UserRole)
            .FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("User not found");

        var role = user.UserRole?.Role.ToString().ToLower() ?? "customer";
        var profile = user.Profile != null
            ? new ProfileDto(user.Profile.Id, user.Profile.UserId, user.Profile.FullName, user.Profile.Phone, user.Profile.AvatarUrl, user.Profile.ShopImage, user.Profile.FreeDelivery)
            : null;

        return new UserDto(user.Id, user.Email, role, profile);
    }

    public async Task<PaginatedResult<UserListDto>> GetAllUsersAsync(int page, int pageSize, string? role)
    {
        var query = _db.Users
            .Include(u => u.UserRole)
            .Include(u => u.Profile)
            .AsQueryable();

        if (!string.IsNullOrEmpty(role) && Enum.TryParse<AppRole>(role, true, out var appRole))
            query = query.Where(u => u.UserRole != null && u.UserRole.Role == appRole);

        var totalCount = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListDto(
                u.Id, u.Email,
                u.UserRole != null ? u.UserRole.Role.ToString().ToLower() : "customer",
                u.Profile != null ? u.Profile.FullName : null,
                u.Profile != null ? u.Profile.Phone : null,
                u.CreatedAt))
            .ToListAsync();

        return new PaginatedResult<UserListDto>(users, totalCount, page, pageSize);
    }

    public async Task<ProfileDto> GetProfileAsync(Guid userId)
    {
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId)
            ?? throw new KeyNotFoundException("Profile not found");

        return new ProfileDto(profile.Id, profile.UserId, profile.FullName, profile.Phone, profile.AvatarUrl, profile.ShopImage, profile.FreeDelivery);
    }

    public async Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId)
            ?? throw new KeyNotFoundException("Profile not found");

        if (dto.FullName != null) profile.FullName = dto.FullName;
        if (dto.Phone != null) profile.Phone = dto.Phone;
        if (dto.AvatarUrl != null) profile.AvatarUrl = dto.AvatarUrl;
        if (dto.ShopImage != null) profile.ShopImage = dto.ShopImage;
        if (dto.FreeDelivery.HasValue) profile.FreeDelivery = dto.FreeDelivery.Value;
        profile.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new ProfileDto(profile.Id, profile.UserId, profile.FullName, profile.Phone, profile.AvatarUrl, profile.ShopImage, profile.FreeDelivery);
    }

    public async Task AdminUpdatePasswordAsync(Guid adminId, AdminUpdatePasswordDto dto)
    {
        var adminRole = await _db.UserRoles.FirstOrDefaultAsync(r => r.UserId == adminId);
        if (adminRole?.Role != AppRole.Admin)
            throw new UnauthorizedAccessException("Admin only");

        var user = await _db.Users.FindAsync(dto.UserId)
            ?? throw new KeyNotFoundException("User not found");

        if (dto.NewPassword.Length < 6)
            throw new ArgumentException("Password must be at least 6 characters");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task AdminDeleteUserAsync(Guid adminId, AdminDeleteUserDto dto)
    {
        var adminRole = await _db.UserRoles.FirstOrDefaultAsync(r => r.UserId == adminId);
        if (adminRole?.Role != AppRole.Admin)
            throw new UnauthorizedAccessException("Admin only");

        if (dto.UserId == adminId)
            throw new InvalidOperationException("Cannot delete your own account");

        var targetRole = await _db.UserRoles.FirstOrDefaultAsync(r => r.UserId == dto.UserId);
        if (targetRole?.Role == AppRole.Admin)
            throw new InvalidOperationException("Cannot delete admin accounts");

        var user = await _db.Users.FindAsync(dto.UserId)
            ?? throw new KeyNotFoundException("User not found");

        // Cascade deletes handle related data via EF Core config
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
    }
}
