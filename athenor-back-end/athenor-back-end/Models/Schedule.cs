using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace athenor_back_end.Models
{
    public class Schedule
    {
        public int Id { get; set; }

        [ForeignKey("User")]
        public int? UserId { get; set; }

        [Required]
        public string TutorName { get; set; } = null!;

        [Required]
        public string DayOfWeek { get; set; } = null!; // Monday, Tuesday, etc.

        [Required]
        public string TimeSlot { get; set; } = null!; // e.g., "9:00 AM - 10:00 AM"

        public string? Section { get; set; } // mathCenter, tutoringCommons, or writingCenter

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual User? User { get; set; }
    }
}
