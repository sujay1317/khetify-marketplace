using Khetify.Application.DTOs.Forum;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class ForumService : IForumService
{
    private readonly KhetifyDbContext _db;

    public ForumService(KhetifyDbContext db)
    {
        _db = db;
    }

    public async Task<List<ForumPostDto>> GetPostsAsync(string? category, Guid? currentUserId)
    {
        var query = _db.ForumPosts
            .Include(p => p.User).ThenInclude(u => u.Profile)
            .Include(p => p.Likes)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        var posts = await query
            .OrderByDescending(p => p.IsPinned)
            .ThenByDescending(p => p.CreatedAt)
            .ToListAsync();

        return posts.Select(p => new ForumPostDto(
            p.Id, p.UserId, p.User?.Profile?.FullName,
            p.Title, p.Content, p.Category,
            p.LikesCount, p.CommentsCount, p.IsPinned,
            currentUserId.HasValue && p.Likes.Any(l => l.UserId == currentUserId.Value),
            p.CreatedAt
        )).ToList();
    }

    public async Task<ForumPostDto?> GetPostByIdAsync(Guid postId, Guid? currentUserId)
    {
        var p = await _db.ForumPosts
            .Include(p => p.User).ThenInclude(u => u.Profile)
            .Include(p => p.Likes)
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (p == null) return null;

        return new ForumPostDto(
            p.Id, p.UserId, p.User?.Profile?.FullName,
            p.Title, p.Content, p.Category,
            p.LikesCount, p.CommentsCount, p.IsPinned,
            currentUserId.HasValue && p.Likes.Any(l => l.UserId == currentUserId.Value),
            p.CreatedAt
        );
    }

    public async Task<ForumPostDto> CreatePostAsync(Guid userId, CreateForumPostDto dto)
    {
        var post = new ForumPost
        {
            UserId = userId,
            Title = dto.Title,
            Content = dto.Content,
            Category = dto.Category
        };

        _db.ForumPosts.Add(post);
        await _db.SaveChangesAsync();

        return await GetPostByIdAsync(post.Id, userId) ?? throw new Exception("Failed");
    }

    public async Task<ForumPostDto> UpdatePostAsync(Guid postId, Guid userId, UpdateForumPostDto dto, bool isAdmin)
    {
        var post = await _db.ForumPosts.FindAsync(postId)
            ?? throw new InvalidOperationException("Post not found");

        if (!isAdmin && post.UserId != userId)
            throw new UnauthorizedAccessException("Not authorized");

        if (dto.Title != null) post.Title = dto.Title;
        if (dto.Content != null) post.Content = dto.Content;
        if (dto.Category != null) post.Category = dto.Category;

        await _db.SaveChangesAsync();
        return await GetPostByIdAsync(postId, userId) ?? throw new Exception("Failed");
    }

    public async Task DeletePostAsync(Guid postId, Guid userId, bool isAdmin)
    {
        var post = await _db.ForumPosts.FindAsync(postId)
            ?? throw new InvalidOperationException("Post not found");

        if (!isAdmin && post.UserId != userId)
            throw new UnauthorizedAccessException("Not authorized");

        _db.ForumPosts.Remove(post);
        await _db.SaveChangesAsync();
    }

    public async Task TogglePostPinAsync(Guid postId)
    {
        var post = await _db.ForumPosts.FindAsync(postId)
            ?? throw new InvalidOperationException("Post not found");

        post.IsPinned = !post.IsPinned;
        await _db.SaveChangesAsync();
    }

    public async Task<List<ForumCommentDto>> GetCommentsAsync(Guid postId, Guid? currentUserId)
    {
        var comments = await _db.ForumComments
            .Include(c => c.User).ThenInclude(u => u.Profile)
            .Include(c => c.Likes)
            .Where(c => c.PostId == postId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        return comments.Select(c => new ForumCommentDto(
            c.Id, c.PostId, c.UserId, c.User?.Profile?.FullName,
            c.Content, c.LikesCount,
            currentUserId.HasValue && c.Likes.Any(l => l.UserId == currentUserId.Value),
            c.CreatedAt
        )).ToList();
    }

    public async Task<ForumCommentDto> CreateCommentAsync(Guid postId, Guid userId, CreateForumCommentDto dto)
    {
        var post = await _db.ForumPosts.FindAsync(postId)
            ?? throw new InvalidOperationException("Post not found");

        var comment = new ForumComment
        {
            PostId = postId,
            UserId = userId,
            Content = dto.Content
        };

        _db.ForumComments.Add(comment);
        post.CommentsCount++;
        await _db.SaveChangesAsync();

        var user = await _db.Users.Include(u => u.Profile).FirstAsync(u => u.Id == userId);
        return new ForumCommentDto(comment.Id, postId, userId, user.Profile?.FullName, dto.Content, 0, false, comment.CreatedAt);
    }

    public async Task<ForumCommentDto> UpdateCommentAsync(Guid commentId, Guid userId, UpdateForumCommentDto dto)
    {
        var comment = await _db.ForumComments
            .Include(c => c.User).ThenInclude(u => u.Profile)
            .FirstOrDefaultAsync(c => c.Id == commentId && c.UserId == userId)
            ?? throw new InvalidOperationException("Comment not found");

        comment.Content = dto.Content;
        await _db.SaveChangesAsync();

        return new ForumCommentDto(comment.Id, comment.PostId, userId, comment.User?.Profile?.FullName,
            comment.Content, comment.LikesCount, false, comment.CreatedAt);
    }

    public async Task DeleteCommentAsync(Guid commentId, Guid userId)
    {
        var comment = await _db.ForumComments.FirstOrDefaultAsync(c => c.Id == commentId && c.UserId == userId)
            ?? throw new InvalidOperationException("Comment not found");

        var post = await _db.ForumPosts.FindAsync(comment.PostId);
        if (post != null) post.CommentsCount = Math.Max(0, post.CommentsCount - 1);

        _db.ForumComments.Remove(comment);
        await _db.SaveChangesAsync();
    }

    public async Task TogglePostLikeAsync(Guid postId, Guid userId)
    {
        var existing = await _db.ForumLikes.FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

        var post = await _db.ForumPosts.FindAsync(postId)
            ?? throw new InvalidOperationException("Post not found");

        if (existing != null)
        {
            _db.ForumLikes.Remove(existing);
            post.LikesCount = Math.Max(0, post.LikesCount - 1);
        }
        else
        {
            _db.ForumLikes.Add(new ForumLike { UserId = userId, PostId = postId });
            post.LikesCount++;
        }

        await _db.SaveChangesAsync();
    }

    public async Task ToggleCommentLikeAsync(Guid commentId, Guid userId)
    {
        var existing = await _db.ForumLikes.FirstOrDefaultAsync(l => l.CommentId == commentId && l.UserId == userId);

        var comment = await _db.ForumComments.FindAsync(commentId)
            ?? throw new InvalidOperationException("Comment not found");

        if (existing != null)
        {
            _db.ForumLikes.Remove(existing);
            comment.LikesCount = Math.Max(0, comment.LikesCount - 1);
        }
        else
        {
            _db.ForumLikes.Add(new ForumLike { UserId = userId, CommentId = commentId });
            comment.LikesCount++;
        }

        await _db.SaveChangesAsync();
    }
}
