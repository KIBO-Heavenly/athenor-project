namespace AthenorBackEnd.DTOs
{
    public class ScheduleEntryDto
    {
        public int? UserId { get; set; }
        public string TutorName { get; set; } = null!;
        public string DayOfWeek { get; set; } = null!;
        public string TimeSlot { get; set; } = null!;
        public string? Section { get; set; }
    }

    public class ScheduleResponseDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string TutorName { get; set; } = null!;
        public string DayOfWeek { get; set; } = null!;
        public string TimeSlot { get; set; } = null!;
        public string? Section { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
