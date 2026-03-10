using System.ComponentModel.DataAnnotations;

namespace athenor_back_end.Models
{
    public class CalendarConfig
    {
        public int Id { get; set; }

        [Required]
        public string ConfigKey { get; set; } = "default"; // Allows for future multi-config support

        [Required]
        public string TimeSlotsJson { get; set; } = null!; // JSON array of time slots

        [Required]
        public string DaysJson { get; set; } = null!; // JSON array of days

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
