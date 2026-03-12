namespace Khetify.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool EmailConfirmed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Profile? Profile { get; set; }
    public UserRole? UserRole { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<ForumPost> ForumPosts { get; set; } = new List<ForumPost>();
    public ICollection<ForumComment> ForumComments { get; set; } = new List<ForumComment>();
    public ICollection<ForumLike> ForumLikes { get; set; } = new List<ForumLike>();
}
