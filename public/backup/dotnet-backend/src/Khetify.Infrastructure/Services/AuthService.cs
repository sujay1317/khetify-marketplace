using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Domain.Enums;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthService(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            throw new InvalidOperationException("Email already registered");

        var user = new User
        {
            Email = dto.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            EmailConfirmed = false
        };

        _db.Users.Add(user);

        var profile = new Profile
        {
            UserId = user.Id,
            FullName = dto.FullName,
            Phone = dto.Phone
        };
        _db.Profiles.Add(profile);

        var role = new UserRole
        {
            UserId = user.Id,
            Role = AppRole.Customer
        };
        _db.UserRoles.Add(role);

        await _db.SaveChangesAsync();

        var token = _tokenService.GenerateAccessToken(user.Id, user.Email, role.Role.ToString().ToLower());
        var refreshToken = _tokenService.GenerateRefreshToken();

        return new AuthResponseDto(token, refreshToken, new UserDto(
            user.Id, user.Email, role.Role.ToString().ToLower(),
            new ProfileDto(profile.Id, profile.UserId, profile.FullName, profile.Phone, null, null, false)
        ));
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.UserRole)
            .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password");

        var roleName = user.UserRole?.Role.ToString().ToLower() ?? "customer";
        var token = _tokenService.GenerateAccessToken(user.Id, user.Email, roleName);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var profile = user.Profile != null
            ? new ProfileDto(user.Profile.Id, user.Profile.UserId, user.Profile.FullName, user.Profile.Phone, user.Profile.AvatarUrl, user.Profile.ShopImage, user.Profile.FreeDelivery)
            : null;

        return new AuthResponseDto(token, refreshToken, new UserDto(user.Id, user.Email, roleName, profile));
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        // In production, store and validate refresh tokens in DB
        throw new NotImplementedException("Implement refresh token storage and validation");
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }
}
