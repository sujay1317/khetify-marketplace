using Khetify.Domain.Entities;

namespace Khetify.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user, string role);
    string GenerateRefreshToken();
    Guid? ValidateToken(string token);
}
