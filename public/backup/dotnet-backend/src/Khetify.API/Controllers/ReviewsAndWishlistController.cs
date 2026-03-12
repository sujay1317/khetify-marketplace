using System.Security.Claims;
using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;
    public ReviewsController(IReviewService reviewService) => _reviewService = reviewService;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsAdmin => User.IsInRole("admin");

    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProduct(Guid productId) => Ok(await _reviewService.GetByProductAsync(productId));

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
        => Ok(await _reviewService.CreateAsync(UserId, dto));

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateReviewDto dto)
        => Ok(await _reviewService.UpdateAsync(id, UserId, dto));

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _reviewService.DeleteAsync(id, UserId, IsAdmin);
        return Ok(new { message = "Review deleted" });
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlistService;
    public WishlistController(IWishlistService wishlistService) => _wishlistService = wishlistService;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _wishlistService.GetByUserAsync(UserId));

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddWishlistDto dto) => Ok(await _wishlistService.AddAsync(UserId, dto));

    [HttpDelete("{productId}")]
    public async Task<IActionResult> Remove(Guid productId)
    {
        await _wishlistService.RemoveAsync(UserId, productId);
        return Ok(new { message = "Removed from wishlist" });
    }
}
