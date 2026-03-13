using Khetify.Application.DTOs.Auth;

namespace Khetify.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task<string> GeneratePasswordResetTokenAsync(string email);
    Task ResetPasswordAsync(string token, string newPassword);
    Task<string?> GetUserEmailAsync(Guid userId);
}
