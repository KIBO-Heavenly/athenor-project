using System.ComponentModel.DataAnnotations;

namespace athenor_back_end.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required] public string Email { get; set; } = null!;
        [Required] public string PasswordHash { get; set; } = null!;
        [Required] public string Role { get; set; } = "Tutor"; // "Admin" or "Tutor"
        public string? FullName { get; set; }
        
        // Email verification
        public bool IsEmailVerified { get; set; } = false;
        public string? EmailVerificationToken { get; set; }
        public DateTime? EmailVerificationExpiry { get; set; }
        
        // Profile
        public string? ProfilePicture { get; set; } // "athenor-male-pfp" or "athenor-female-pfp"
        public bool OptOutReviews { get; set; } = false;
        
        // Password reset
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetExpiry { get; set; }
        
        // Navigation property for reviews
        public ICollection<Review>? Reviews { get; set; }
    }
}
