using System.Security.Claims;
using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    public UsersController(IUserService userService) => _userService = userService;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsAdmin => User.IsInRole("admin");

    [HttpGet("me")]
    public async Task<IActionResult> GetMe() => Ok(await _userService.GetByIdAsync(UserId));

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile() => Ok(await _userService.GetProfileAsync(UserId));

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        => Ok(await _userService.UpdateProfileAsync(UserId, dto));

    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? role = null)
        => Ok(await _userService.GetAllUsersAsync(page, pageSize, role));

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id) => Ok(await _userService.GetByIdAsync(id));

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("update-password")]
    public async Task<IActionResult> AdminUpdatePassword([FromBody] AdminUpdatePasswordDto dto)
    {
        await _userService.AdminUpdatePasswordAsync(UserId, dto);
        return Ok(new { message = "Password updated" });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        await _userService.AdminDeleteUserAsync(UserId, new AdminDeleteUserDto(id));
        return Ok(new { message = "User deleted" });
    }
}
