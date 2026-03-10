using System.ComponentModel.DataAnnotations;

namespace athenor_back_end.Models
{
    public class TutorColor
    {
        public int Id { get; set; }

        [Required]
        public string TutorName { get; set; } = null!;

        [Required]
        public string ColorLight { get; set; } = null!; // Light mode hex color

        [Required]
        public string ColorDark { get; set; } = null!; // Dark mode hex color

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
