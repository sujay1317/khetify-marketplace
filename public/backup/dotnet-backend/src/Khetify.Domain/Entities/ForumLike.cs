namespace Khetify.Domain.Entities;

public class ForumLike
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid? PostId { get; set; }
    public Guid? CommentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public ForumPost? Post { get; set; }
    public ForumComment? Comment { get; set; }
}
