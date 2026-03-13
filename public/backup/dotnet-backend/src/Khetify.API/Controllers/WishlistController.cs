using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class WishlistController : BaseController
{
    private readonly IWishlistService _wishlistService;

    public WishlistController(IWishlistService wishlistService)
    {
        _wishlistService = wishlistService;
    }

    [HttpGet]
    public async Task<IActionResult> GetWishlist()
    {
        var items = await _wishlistService.GetWishlistAsync(GetUserId());
        return Ok(items);
    }

    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> AddToWishlist(Guid productId)
    {
        try
        {
            var item = await _wishlistService.AddToWishlistAsync(GetUserId(), productId);
            return Ok(item);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> RemoveFromWishlist(Guid productId)
    {
        try
        {
            await _wishlistService.RemoveFromWishlistAsync(GetUserId(), productId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
