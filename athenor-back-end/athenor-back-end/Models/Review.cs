using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace athenor_back_end.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TutorId { get; set; }

        [ForeignKey("TutorId")]
        public User? Tutor { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string Comment { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ReviewerName { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
