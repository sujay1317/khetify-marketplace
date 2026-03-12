using System.Security.Claims;
using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ForumController : ControllerBase
{
    private readonly IForumService _forumService;
    public ForumController(IForumService forumService) => _forumService = forumService;

    private Guid? CurrentUserId => User.Identity?.IsAuthenticated == true
        ? Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!) : null;
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsAdmin => User.IsInRole("admin");

    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? category = null)
        => Ok(await _forumService.GetPostsAsync(page, pageSize, category, CurrentUserId));

    [HttpGet("posts/{id}")]
    public async Task<IActionResult> GetPost(Guid id) => Ok(await _forumService.GetPostByIdAsync(id, CurrentUserId));

    [Authorize]
    [HttpPost("posts")]
    public async Task<IActionResult> CreatePost([FromBody] CreateForumPostDto dto)
        => Ok(await _forumService.CreatePostAsync(UserId, dto));

    [Authorize]
    [HttpPut("posts/{id}")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdateForumPostDto dto)
        => Ok(await _forumService.UpdatePostAsync(id, UserId, dto, IsAdmin));

    [Authorize]
    [HttpDelete("posts/{id}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        await _forumService.DeletePostAsync(id, UserId, IsAdmin);
        return Ok(new { message = "Post deleted" });
    }

    [HttpGet("posts/{postId}/comments")]
    public async Task<IActionResult> GetComments(Guid postId) => Ok(await _forumService.GetCommentsAsync(postId));

    [Authorize]
    [HttpPost("posts/{postId}/comments")]
    public async Task<IActionResult> CreateComment(Guid postId, [FromBody] CreateForumCommentDto dto)
        => Ok(await _forumService.CreateCommentAsync(UserId, postId, dto));

    [Authorize]
    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        await _forumService.DeleteCommentAsync(id, UserId, IsAdmin);
        return Ok(new { message = "Comment deleted" });
    }

    [Authorize]
    [HttpPost("posts/{postId}/like")]
    public async Task<IActionResult> ToggleLikePost(Guid postId)
    {
        await _forumService.ToggleLikePostAsync(UserId, postId);
        return Ok(new { message = "Toggled" });
    }

    [Authorize]
    [HttpPost("comments/{commentId}/like")]
    public async Task<IActionResult> ToggleLikeComment(Guid commentId)
    {
        await _forumService.ToggleLikeCommentAsync(UserId, commentId);
        return Ok(new { message = "Toggled" });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("posts/{id}/pin")]
    public async Task<IActionResult> TogglePin(Guid id)
    {
        await _forumService.TogglePinAsync(id);
        return Ok(new { message = "Pin toggled" });
    }
}
