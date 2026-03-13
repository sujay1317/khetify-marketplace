using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class UploadController : BaseController
{
    private readonly IFileStorageService _fileStorage;

    public UploadController(IFileStorageService fileStorage)
    {
        _fileStorage = fileStorage;
    }

    [HttpPost("product-image")]
    public async Task<IActionResult> UploadProductImage(IFormFile file)
    {
        if (file.Length == 0) return BadRequest(new { error = "No file uploaded" });
        if (file.Length > 5 * 1024 * 1024) return BadRequest(new { error = "File too large (max 5MB)" });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest(new { error = "Only JPEG, PNG, and WebP images are allowed" });

        var url = await _fileStorage.UploadFileAsync(file.OpenReadStream(), file.FileName, "product-images");
        return Ok(new { url });
    }

    [HttpPost("shop-image")]
    public async Task<IActionResult> UploadShopImage(IFormFile file)
    {
        if (file.Length == 0) return BadRequest(new { error = "No file uploaded" });
        if (file.Length > 5 * 1024 * 1024) return BadRequest(new { error = "File too large (max 5MB)" });

        var url = await _fileStorage.UploadFileAsync(file.OpenReadStream(), file.FileName, "shop-images");
        return Ok(new { url });
    }
}
