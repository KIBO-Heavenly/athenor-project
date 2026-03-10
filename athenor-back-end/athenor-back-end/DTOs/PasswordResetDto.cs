using System.ComponentModel.DataAnnotations;

namespace AthenorBackEnd.DTOs
{
    public class ForgotPasswordDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string Email { get; set; } = null!;
    }

    public class ResetPasswordDto
    {
        [Required(ErrorMessage = "Token is required")]
        [StringLength(500, ErrorMessage = "Token is invalid")]
        public string Token { get; set; } = null!;

        [Required(ErrorMessage = "New password is required")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 100 characters")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$",
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")]
        public string NewPassword { get; set; } = null!;
    }

    public class VerifyEmailDto
    {
        [Required(ErrorMessage = "Token is required")]
        [StringLength(500, ErrorMessage = "Token is invalid")]
        public string Token { get; set; } = null!;
    }
}
