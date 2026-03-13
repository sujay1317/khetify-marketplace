using Khetify.Application.DTOs.Forum;

namespace Khetify.Application.Interfaces;

public interface IForumService
{
    Task<List<ForumPostDto>> GetPostsAsync(string? category, Guid? currentUserId);
    Task<ForumPostDto?> GetPostByIdAsync(Guid postId, Guid? currentUserId);
    Task<ForumPostDto> CreatePostAsync(Guid userId, CreateForumPostDto dto);
    Task<ForumPostDto> UpdatePostAsync(Guid postId, Guid userId, UpdateForumPostDto dto, bool isAdmin);
    Task DeletePostAsync(Guid postId, Guid userId, bool isAdmin);
    Task TogglePostPinAsync(Guid postId);
    // Comments
    Task<List<ForumCommentDto>> GetCommentsAsync(Guid postId, Guid? currentUserId);
    Task<ForumCommentDto> CreateCommentAsync(Guid postId, Guid userId, CreateForumCommentDto dto);
    Task<ForumCommentDto> UpdateCommentAsync(Guid commentId, Guid userId, UpdateForumCommentDto dto);
    Task DeleteCommentAsync(Guid commentId, Guid userId);
    // Likes
    Task TogglePostLikeAsync(Guid postId, Guid userId);
    Task ToggleCommentLikeAsync(Guid commentId, Guid userId);
}
