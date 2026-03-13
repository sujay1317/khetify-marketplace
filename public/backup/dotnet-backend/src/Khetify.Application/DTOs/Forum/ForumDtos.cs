namespace Khetify.Application.DTOs.Forum;

public record CreateForumPostDto(string Title, string Content, string Category);
public record UpdateForumPostDto(string? Title, string? Content, string? Category);
public record CreateForumCommentDto(string Content);
public record UpdateForumCommentDto(string Content);

public record ForumPostDto(
    Guid Id,
    Guid UserId,
    string? UserName,
    string Title,
    string Content,
    string Category,
    int LikesCount,
    int CommentsCount,
    bool IsPinned,
    bool IsLikedByCurrentUser,
    DateTime CreatedAt
);

public record ForumCommentDto(
    Guid Id,
    Guid PostId,
    Guid UserId,
    string? UserName,
    string Content,
    int LikesCount,
    bool IsLikedByCurrentUser,
    DateTime CreatedAt
);
