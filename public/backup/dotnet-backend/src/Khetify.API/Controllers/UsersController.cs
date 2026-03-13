using Khetify.Application.DTOs.Users;
using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class UsersController : BaseController
{
    private readonly IUserService _userService;
    private readonly IFileStorageService _fileStorage;

    public UsersController(IUserService userService, IFileStorageService fileStorage)
    {
        _userService = userService;
        _fileStorage = fileStorage;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await _userService.GetProfileAsync(GetUserId());
        return profile == null ? NotFound() : Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var profile = await _userService.UpdateProfileAsync(GetUserId(), dto);
        return Ok(profile);
    }

    [HttpPost("profile/avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var url = await _fileStorage.UploadFileAsync(file.OpenReadStream(), file.FileName, "avatars");
        var profile = await _userService.UpdateProfileAsync(GetUserId(), new UpdateProfileDto(null, null, url, null, null));
        return Ok(profile);
    }

    [HttpPost("profile/shop-image")]
    public async Task<IActionResult> UploadShopImage(IFormFile file)
    {
        var url = await _fileStorage.UploadFileAsync(file.OpenReadStream(), file.FileName, "shop-images");
        var profile = await _userService.UpdateProfileAsync(GetUserId(), new UpdateProfileDto(null, null, null, url, null));
        return Ok(profile);
    }

    [AllowAnonymous]
    [HttpGet("sellers")]
    public async Task<IActionResult> GetAllSellers()
    {
        var sellers = await _userService.GetAllSellersAsync();
        return Ok(sellers);
    }

    [AllowAnonymous]
    [HttpGet("sellers/{sellerId:guid}")]
    public async Task<IActionResult> GetSellerInfo(Guid sellerId)
    {
        var seller = await _userService.GetSellerPublicInfoAsync(sellerId);
        return seller == null ? NotFound() : Ok(seller);
    }

    // ===== Admin endpoints =====

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("admin/create-seller")]
    public async Task<IActionResult> CreateSeller([FromBody] CreateSellerDto dto)
    {
        try
        {
            var seller = await _userService.CreateSellerAsync(dto);
            return Ok(seller);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("admin/update-password")]
    public async Task<IActionResult> UpdateUserPassword([FromBody] UpdateUserPasswordDto dto)
    {
        try
        {
            await _userService.UpdateUserPasswordAsync(GetUserId(), dto);
            return Ok(new { message = "Password updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("admin/{userId:guid}")]
    public async Task<IActionResult> DeleteUser(Guid userId)
    {
        try
        {
            await _userService.DeleteUserAsync(GetUserId(), userId);
            return Ok(new { message = "User deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
