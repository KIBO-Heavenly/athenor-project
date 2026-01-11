using System.ComponentModel.DataAnnotations;

namespace athenor_back_end.Models
{
    public class TutorAvailability
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string TutorName { get; set; } = string.Empty;

        // Store availability as JSON string
        // Format: { "10:00 - 10:30 AM": { "Monday": true, "Tuesday": false, ... }, ... }
        [Required]
        public string AvailabilityJson { get; set; } = "{}";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
