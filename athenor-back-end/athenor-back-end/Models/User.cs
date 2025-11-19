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
    }
}
