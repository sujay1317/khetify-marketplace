using Khetify.Application.DTOs.Forum;
using Khetify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khetify.API.Controllers;

[Route("api/[controller]")]
public class ForumController : BaseController
{
    private readonly IForumService _forumService;

    public ForumController(IForumService forumService)
    {
        _forumService = forumService;
    }

    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts([FromQuery] string? category)
    {
        Guid? userId = User.Identity?.IsAuthenticated == true ? GetUserId() : null;
        var posts = await _forumService.GetPostsAsync(category, userId);
        return Ok(posts);
    }

    [HttpGet("posts/{id:guid}")]
    public async Task<IActionResult> GetPost(Guid id)
    {
        Guid? userId = User.Identity?.IsAuthenticated == true ? GetUserId() : null;
        var post = await _forumService.GetPostByIdAsync(id, userId);
        return post == null ? NotFound() : Ok(post);
    }

    [Authorize]
    [HttpPost("posts")]
    public async Task<IActionResult> CreatePost([FromBody] CreateForumPostDto dto)
    {
        var post = await _forumService.CreatePostAsync(GetUserId(), dto);
        return Ok(post);
    }

    [Authorize]
    [HttpPut("posts/{id:guid}")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdateForumPostDto dto)
    {
        try
        {
            var post = await _forumService.UpdatePostAsync(id, GetUserId(), dto, IsAdmin);
            return Ok(post);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("posts/{id:guid}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        try
        {
            await _forumService.DeletePostAsync(id, GetUserId(), IsAdmin);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("posts/{id:guid}/pin")]
    public async Task<IActionResult> TogglePin(Guid id)
    {
        await _forumService.TogglePostPinAsync(id);
        return Ok();
    }

    // ===== Comments =====

    [HttpGet("posts/{postId:guid}/comments")]
    public async Task<IActionResult> GetComments(Guid postId)
    {
        Guid? userId = User.Identity?.IsAuthenticated == true ? GetUserId() : null;
        var comments = await _forumService.GetCommentsAsync(postId, userId);
        return Ok(comments);
    }

    [Authorize]
    [HttpPost("posts/{postId:guid}/comments")]
    public async Task<IActionResult> CreateComment(Guid postId, [FromBody] CreateForumCommentDto dto)
    {
        var comment = await _forumService.CreateCommentAsync(postId, GetUserId(), dto);
        return Ok(comment);
    }

    [Authorize]
    [HttpPut("comments/{id:guid}")]
    public async Task<IActionResult> UpdateComment(Guid id, [FromBody] UpdateForumCommentDto dto)
    {
        try
        {
            var comment = await _forumService.UpdateCommentAsync(id, GetUserId(), dto);
            return Ok(comment);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("comments/{id:guid}")]
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        try
        {
            await _forumService.DeleteCommentAsync(id, GetUserId());
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // ===== Likes =====

    [Authorize]
    [HttpPost("posts/{postId:guid}/like")]
    public async Task<IActionResult> TogglePostLike(Guid postId)
    {
        await _forumService.TogglePostLikeAsync(postId, GetUserId());
        return Ok();
    }

    [Authorize]
    [HttpPost("comments/{commentId:guid}/like")]
    public async Task<IActionResult> ToggleCommentLike(Guid commentId)
    {
        await _forumService.ToggleCommentLikeAsync(commentId, GetUserId());
        return Ok();
    }
}
