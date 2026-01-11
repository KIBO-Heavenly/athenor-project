using Microsoft.AspNetCore.Mvc;
using athenor_back_end.Data;
using athenor_back_end.Models;
using AthenorBackEnd.DTOs;
using Microsoft.EntityFrameworkCore;

namespace athenor_back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScheduleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ScheduleController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET all schedules
        [HttpGet]
        public async Task<IActionResult> GetAllSchedules()
        {
            var schedules = await _context.Schedules.ToListAsync();
            return Ok(schedules);
        }

        // GET schedules for a specific tutor
        [HttpGet("tutor/{tutorId}")]
        public async Task<IActionResult> GetTutorSchedules(int tutorId)
        {
            var schedules = await _context.Schedules
                .Where(s => s.UserId == tutorId)
                .ToListAsync();
            
            if (!schedules.Any())
                return NotFound(new { message = "No schedules found for this tutor" });

            return Ok(schedules);
        }

        // POST - Add a new schedule entry
        [HttpPost]
        public async Task<IActionResult> AddSchedule([FromBody] ScheduleEntryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var schedule = new Schedule
            {
                UserId = dto.UserId,
                TutorName = dto.TutorName,
                DayOfWeek = dto.DayOfWeek,
                TimeSlot = dto.TimeSlot,
                Section = dto.Section
            };

            _context.Schedules.Add(schedule);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Schedule added successfully", id = schedule.Id });
        }

        // DELETE - Remove a schedule entry
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var schedule = await _context.Schedules.FindAsync(id);
            if (schedule == null)
                return NotFound(new { message = "Schedule not found" });

            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Schedule deleted successfully" });
        }

        // DELETE all schedules for a tutor
        [HttpDelete("tutor/{tutorId}/all")]
        public async Task<IActionResult> DeleteTutorSchedules(int tutorId)
        {
            var schedules = await _context.Schedules
                .Where(s => s.UserId == tutorId)
                .ToListAsync();

            if (!schedules.Any())
                return NotFound(new { message = "No schedules found for this tutor" });

            _context.Schedules.RemoveRange(schedules);
            await _context.SaveChangesAsync();

            return Ok(new { message = "All schedules deleted successfully" });
        }

        // DELETE all schedules for a tutor by name
        [HttpDelete("tutor-name/{tutorName}")]
        public async Task<IActionResult> DeleteTutorSchedulesByName(string tutorName)
        {
            var schedules = await _context.Schedules
                .Where(s => s.TutorName == tutorName)
                .ToListAsync();

            if (!schedules.Any())
                return Ok(new { message = "No schedules found for this tutor" });

            _context.Schedules.RemoveRange(schedules);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"All schedules for {tutorName} deleted successfully" });
        }

        // DELETE all schedules (clear entire schedule)
        [HttpDelete("clear-all")]
        public async Task<IActionResult> ClearAllSchedules()
        {
            var schedules = await _context.Schedules.ToListAsync();
            
            if (schedules.Any())
            {
                _context.Schedules.RemoveRange(schedules);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "All schedules cleared successfully" });
        }
    }
}
