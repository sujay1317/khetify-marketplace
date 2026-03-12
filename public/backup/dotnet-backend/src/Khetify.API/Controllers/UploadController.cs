using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IFileStorageService _fileStorage;
    public UploadController(IFileStorageService fileStorage) => _fileStorage = fileStorage;

    [Authorize]
    [HttpPost("{folder}")]
    public async Task<IActionResult> Upload(string folder, IFormFile file)
    {
        if (file.Length == 0) return BadRequest(new { error = "No file provided" });
        if (file.Length > 10 * 1024 * 1024) return BadRequest(new { error = "File too large (max 10MB)" });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest(new { error = "Invalid file type" });

        var url = await _fileStorage.UploadAsync(file.OpenReadStream(), file.FileName, folder);
        return Ok(new { url });
    }
}
