using Khetify.Application.DTOs;
using Khetify.Application.Interfaces;
using Khetify.Domain.Entities;
using Khetify.Domain.Enums;
using Khetify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Khetify.Infrastructure.Services;

public class ForumService : IForumService
{
    private readonly AppDbContext _db;
    public ForumService(AppDbContext db) => _db = db;

    public async Task<PaginatedResult<ForumPostDto>> GetPostsAsync(int page, int pageSize, string? category, Guid? currentUserId)
    {
        var query = _db.ForumPosts
            .Include(p => p.User).ThenInclude(u => u.Profile)
            .Include(p => p.Likes)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        var total = await query.CountAsync();
        var posts = await query
            .OrderByDescending(p => p.IsPinned)
            .ThenByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();

        return new PaginatedResult<ForumPostDto>(
            posts.Select(p => MapPostToDto(p, currentUserId)).ToList(), total, page, pageSize);
    }

    public async Task<ForumPostDto> GetPostByIdAsync(Guid postId, Guid? currentUserId)
    {
        var post = await _db.ForumPosts
            .Include(p => p.User).ThenInclude(u => u.Profile)
            .Include(p => p.Likes)
            .FirstOrDefaultAsync(p => p.Id == postId)
            ?? throw new KeyNotFoundException("Post not found");

        return MapPostToDto(post, currentUserId);
    }

    public async Task<ForumPostDto> CreatePostAsync(Guid userId, CreateForumPostDto dto)
    {
        var post = new ForumPost { UserId = userId, Title = dto.Title, Content = dto.Content, Category = dto.Category };
        _db.ForumPosts.Add(post);
        await _db.SaveChangesAsync();
        return await GetPostByIdAsync(post.Id, userId);
    }

    public async Task<ForumPostDto> UpdatePostAsync(Guid postId, Guid userId, UpdateForumPostDto dto, bool isAdmin)
    {
        var post = await _db.ForumPosts.FindAsync(postId) ?? throw new KeyNotFoundException("Post not found");
        if (!isAdmin && post.UserId != userId) throw new UnauthorizedAccessException("Not authorized");
        if (dto.Title != null) post.Title = dto.Title;
        if (dto.Content != null) post.Content = dto.Content;
        if (dto.Category != null) post.Category = dto.Category;
        post.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await GetPostByIdAsync(postId, userId);
    }

    public async Task DeletePostAsync(Guid postId, Guid userId, bool isAdmin)
    {
        var post = await _db.ForumPosts.FindAsync(postId) ?? throw new KeyNotFoundException("Post not found");
        if (!isAdmin && post.UserId != userId) throw new UnauthorizedAccessException("Not authorized");
        _db.ForumPosts.Remove(post);
        await _db.SaveChangesAsync();
    }

    public async Task<List<ForumCommentDto>> GetCommentsAsync(Guid postId)
    {
        return await _db.ForumComments
            .Where(c => c.PostId == postId)
            .Include(c => c.User).ThenInclude(u => u.Profile)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new ForumCommentDto(c.Id, c.PostId, c.UserId, c.Content, c.LikesCount, c.CreatedAt,
                c.User.Profile != null ? c.User.Profile.FullName : null))
            .ToListAsync();
    }

    public async Task<ForumCommentDto> CreateCommentAsync(Guid userId, Guid postId, CreateForumCommentDto dto)
    {
        var post = await _db.ForumPosts.FindAsync(postId) ?? throw new KeyNotFoundException("Post not found");
        var comment = new ForumComment { PostId = postId, UserId = userId, Content = dto.Content };
        _db.ForumComments.Add(comment);
        post.CommentsCount++;
        await _db.SaveChangesAsync();
        var user = await _db.Users.Include(u => u.Profile).FirstAsync(u => u.Id == userId);
        return new ForumCommentDto(comment.Id, comment.PostId, comment.UserId, comment.Content, 0, comment.CreatedAt, user.Profile?.FullName);
    }

    public async Task DeleteCommentAsync(Guid commentId, Guid userId, bool isAdmin)
    {
        var comment = await _db.ForumComments.FindAsync(commentId) ?? throw new KeyNotFoundException("Comment not found");
        if (!isAdmin && comment.UserId != userId) throw new UnauthorizedAccessException("Not authorized");
        var post = await _db.ForumPosts.FindAsync(comment.PostId);
        if (post != null) post.CommentsCount = Math.Max(0, post.CommentsCount - 1);
        _db.ForumComments.Remove(comment);
        await _db.SaveChangesAsync();
    }

    public async Task ToggleLikePostAsync(Guid userId, Guid postId)
    {
        var existing = await _db.ForumLikes.FirstOrDefaultAsync(l => l.UserId == userId && l.PostId == postId);
        var post = await _db.ForumPosts.FindAsync(postId) ?? throw new KeyNotFoundException("Post not found");

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

    public async Task ToggleLikeCommentAsync(Guid userId, Guid commentId)
    {
        var existing = await _db.ForumLikes.FirstOrDefaultAsync(l => l.UserId == userId && l.CommentId == commentId);
        var comment = await _db.ForumComments.FindAsync(commentId) ?? throw new KeyNotFoundException("Comment not found");

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

    public async Task TogglePinAsync(Guid postId)
    {
        var post = await _db.ForumPosts.FindAsync(postId) ?? throw new KeyNotFoundException("Post not found");
        post.IsPinned = !post.IsPinned;
        await _db.SaveChangesAsync();
    }

    private static ForumPostDto MapPostToDto(ForumPost p, Guid? currentUserId) => new(
        p.Id, p.UserId, p.Title, p.Content, p.Category, p.LikesCount, p.CommentsCount, p.IsPinned, p.CreatedAt,
        p.User?.Profile?.FullName,
        currentUserId.HasValue && p.Likes.Any(l => l.UserId == currentUserId.Value));
}

public class SellerService : ISellerService
{
    private readonly AppDbContext _db;
    public SellerService(AppDbContext db) => _db = db;

    public async Task<UserDto> CreateSellerAsync(Guid adminId, CreateSellerDto dto)
    {
        var adminRole = await _db.UserRoles.FirstOrDefaultAsync(r => r.UserId == adminId);
        if (adminRole?.Role != AppRole.Admin) throw new UnauthorizedAccessException("Admin only");

        var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (existing != null)
        {
            // Convert existing user to seller
            var role = await _db.UserRoles.FirstOrDefaultAsync(r => r.UserId == existing.Id);
            if (role != null) { role.Role = AppRole.Seller; }
            else { _db.UserRoles.Add(new UserRole { UserId = existing.Id, Role = AppRole.Seller }); }

            var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == existing.Id);
            if (profile != null)
            {
                profile.FullName = dto.FullName;
                profile.Phone = dto.Phone;
                profile.FreeDelivery = dto.FreeDelivery;
            }

            existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            await _db.SaveChangesAsync();

            return new UserDto(existing.Id, existing.Email, "seller", profile != null
                ? new ProfileDto(profile.Id, profile.UserId, profile.FullName, profile.Phone, profile.AvatarUrl, profile.ShopImage, profile.FreeDelivery)
                : null);
        }

        // Create new
        var user = new User { Email = dto.Email.ToLower(), PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password), EmailConfirmed = true };
        _db.Users.Add(user);
        var newProfile = new Profile { UserId = user.Id, FullName = dto.FullName, Phone = dto.Phone, FreeDelivery = dto.FreeDelivery };
        _db.Profiles.Add(newProfile);
        _db.UserRoles.Add(new UserRole { UserId = user.Id, Role = AppRole.Seller });
        await _db.SaveChangesAsync();

        return new UserDto(user.Id, user.Email, "seller", new ProfileDto(newProfile.Id, newProfile.UserId, newProfile.FullName, newProfile.Phone, null, null, newProfile.FreeDelivery));
    }

    public async Task<SellerPublicInfoDto> GetPublicInfoAsync(Guid sellerId)
    {
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == sellerId)
            ?? throw new KeyNotFoundException("Seller not found");
        return new SellerPublicInfoDto(profile.UserId, profile.FullName ?? "", profile.ShopImage, profile.FreeDelivery);
    }

    public async Task<List<SellerPublicInfoDto>> GetAllSellersAsync()
    {
        return await _db.UserRoles
            .Where(r => r.Role == AppRole.Seller)
            .Join(_db.Profiles, r => r.UserId, p => p.UserId, (r, p) => new SellerPublicInfoDto(p.UserId, p.FullName ?? "", p.ShopImage, p.FreeDelivery))
            .ToListAsync();
    }
}

public class FileStorageService : IFileStorageService
{
    private readonly string _basePath;

    public FileStorageService(string basePath)
    {
        _basePath = basePath;
        if (!Directory.Exists(_basePath)) Directory.CreateDirectory(_basePath);
    }

    public async Task<string> UploadAsync(Stream file, string fileName, string folder)
    {
        var dir = Path.Combine(_basePath, folder);
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

        var uniqueName = $"{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(dir, uniqueName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/{folder}/{uniqueName}";
    }

    public Task DeleteAsync(string fileUrl)
    {
        var filePath = Path.Combine(_basePath, fileUrl.TrimStart('/').Replace("uploads/", ""));
        if (File.Exists(filePath)) File.Delete(filePath);
        return Task.CompletedTask;
    }
}
