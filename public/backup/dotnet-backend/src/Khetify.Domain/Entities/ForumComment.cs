namespace Khetify.Domain.Entities;

public class ForumComment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PostId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public int LikesCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ForumPost Post { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<ForumLike> Likes { get; set; } = new List<ForumLike>();
}
