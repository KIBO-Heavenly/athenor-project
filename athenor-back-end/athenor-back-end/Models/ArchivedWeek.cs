using System.ComponentModel.DataAnnotations;

namespace athenor_back_end.Models
{
    public class ArchivedWeek
    {
        public int Id { get; set; }

        [Required]
        public string StartDate { get; set; } = null!; // e.g., "Jan 20"

        [Required]
        public string EndDate { get; set; } = null!; // e.g., "Jan 24"

        [Required]
        public int Year { get; set; }

        [Required]
        public string AssignmentsJson { get; set; } = null!; // JSON string of assignments

        [Required]
        public string TutorHoursJson { get; set; } = null!; // JSON string of tutor hours

        public DateTime ArchivedAt { get; set; } = DateTime.UtcNow;
    }
}
