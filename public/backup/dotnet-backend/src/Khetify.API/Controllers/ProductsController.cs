using System.Security.Claims;
using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    public ProductsController(IProductService productService) => _productService = productService;

    private Guid? UserId => User.Identity?.IsAuthenticated == true
        ? Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!) : null;
    private bool IsAdmin => User.IsInRole("admin");

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? category = null, [FromQuery] string? search = null,
        [FromQuery] bool? isOrganic = null, [FromQuery] string? sortBy = null,
        [FromQuery] Guid? sellerId = null)
    {
        var includeUnapproved = IsAdmin || (sellerId.HasValue && sellerId == UserId);
        return Ok(await _productService.GetAllAsync(page, pageSize, category, search, isOrganic, sortBy, sellerId, includeUnapproved));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id) => Ok(await _productService.GetByIdAsync(id, UserId));

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        => Ok(await _productService.CreateAsync(UserId!.Value, dto));

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductDto dto)
        => Ok(await _productService.UpdateAsync(id, UserId!.Value, dto, IsAdmin));

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _productService.DeleteAsync(id, UserId!.Value, IsAdmin);
        return Ok(new { message = "Product deleted" });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(Guid id) => Ok(await _productService.ApproveAsync(id));

    [HttpGet("{id}/images")]
    public async Task<IActionResult> GetImages(Guid id) => Ok(await _productService.GetImagesAsync(id));

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpPost("{id}/images")]
    public async Task<IActionResult> AddImage(Guid id, [FromBody] ProductImageDto dto)
        => Ok(await _productService.AddImageAsync(id, UserId!.Value, dto.ImageUrl, dto.DisplayOrder));

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpDelete("images/{imageId}")]
    public async Task<IActionResult> DeleteImage(Guid imageId)
    {
        await _productService.DeleteImageAsync(imageId, UserId!.Value, IsAdmin);
        return Ok(new { message = "Image deleted" });
    }
}
