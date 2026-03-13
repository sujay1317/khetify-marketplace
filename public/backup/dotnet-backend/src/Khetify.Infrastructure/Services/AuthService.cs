using Khetify.Application.DTOs.Auth;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Domain.Enums;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly KhetifyDbContext _db;
    private readonly IJwtService _jwt;

    public AuthService(KhetifyDbContext db, IJwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            throw new InvalidOperationException("Email already registered");

        var user = new User
        {
            Email = dto.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        var profile = new Profile
        {
            UserId = user.Id,
            FullName = dto.FullName,
            Phone = dto.Phone
        };

        var userRole = new UserRole
        {
            UserId = user.Id,
            Role = AppRole.Customer
        };

        _db.Users.Add(user);
        _db.Profiles.Add(profile);
        _db.UserRoles.Add(userRole);
        await _db.SaveChangesAsync();

        var token = _jwt.GenerateToken(user, "customer");
        var refreshToken = _jwt.GenerateRefreshToken();

        return new AuthResponseDto(token, refreshToken, new UserInfoDto(user.Id, user.Email, "customer", dto.FullName));
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.UserRole)
            .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password");

        var role = user.UserRole?.Role.ToString().ToLower() ?? "customer";
        var token = _jwt.GenerateToken(user, role);
        var refreshToken = _jwt.GenerateRefreshToken();

        return new AuthResponseDto(token, refreshToken, new UserInfoDto(user.Id, user.Email, role, user.Profile?.FullName));
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();
    }

    public async Task<string> GeneratePasswordResetTokenAsync(string email)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower())
            ?? throw new InvalidOperationException("User not found");

        // In production, generate a secure token, store it with expiry, and email it
        // For now, return a placeholder
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    }

    public async Task ResetPasswordAsync(string token, string newPassword)
    {
        // In production, validate the token from storage and find the user
        // This is a placeholder implementation
        throw new NotImplementedException("Implement token-based password reset with email service");
    }

    public async Task<string?> GetUserEmailAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        return user?.Email;
    }
}
