using Khetify.Application.DTOs.Products;
using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[Route("api/[controller]")]
public class ProductsController : BaseController
{
    private readonly IProductService _productService;
    private readonly IFileStorageService _fileStorage;

    public ProductsController(IProductService productService, IFileStorageService fileStorage)
    {
        _productService = productService;
        _fileStorage = fileStorage;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] bool? isOrganic,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _productService.GetProductsAsync(category, search, isOrganic, sort, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpGet("seller/{sellerId:guid}")]
    public async Task<IActionResult> GetSellerProducts(Guid sellerId)
    {
        var products = await _productService.GetSellerProductsAsync(sellerId);
        return Ok(products);
    }

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpGet("my-products")]
    public async Task<IActionResult> GetMyProducts()
    {
        var products = await _productService.GetSellerProductsAsync(GetUserId());
        return Ok(products);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingProducts()
    {
        var products = await _productService.GetPendingProductsAsync();
        return Ok(products);
    }

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
    {
        var product = await _productService.CreateProductAsync(GetUserId(), dto);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductDto dto)
    {
        try
        {
            var product = await _productService.UpdateProductAsync(id, GetUserId(), dto, IsAdmin);
            return Ok(product);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        try
        {
            await _productService.DeleteProductAsync(id, GetUserId(), IsAdmin);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> ApproveProduct(Guid id)
    {
        var product = await _productService.ApproveProductAsync(id);
        return Ok(product);
    }

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpPost("{id:guid}/images")]
    public async Task<IActionResult> UploadProductImage(Guid id, IFormFile file, [FromQuery] int displayOrder = 0)
    {
        var url = await _fileStorage.UploadFileAsync(file.OpenReadStream(), file.FileName, "product-images");
        var image = await _productService.AddProductImageAsync(id, GetUserId(), url, displayOrder);
        return Ok(image);
    }

    [Authorize(Policy = "SellerOrAdmin")]
    [HttpDelete("images/{imageId:guid}")]
    public async Task<IActionResult> DeleteProductImage(Guid imageId)
    {
        await _productService.DeleteProductImageAsync(imageId, GetUserId(), IsAdmin);
        return NoContent();
    }
}
