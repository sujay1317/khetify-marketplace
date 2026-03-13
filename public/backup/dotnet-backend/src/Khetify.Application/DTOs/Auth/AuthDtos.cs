namespace Khetify.Application.DTOs.Auth;

public record RegisterDto(string Email, string Password, string FullName, string? Phone);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string RefreshToken, UserInfoDto User);
public record UserInfoDto(Guid Id, string Email, string Role, string? FullName);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);
public record ResetPasswordDto(string Email);
