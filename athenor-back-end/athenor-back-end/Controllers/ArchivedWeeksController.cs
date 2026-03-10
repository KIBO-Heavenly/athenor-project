using Microsoft.AspNetCore.Mvc;
using athenor_back_end.Data;
using athenor_back_end.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace athenor_back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All authenticated users can manage archived weeks
    public class ArchivedWeeksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ArchivedWeeksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET all archived weeks
        [HttpGet]
        public async Task<IActionResult> GetAllArchives()
        {
            var archives = await _context.ArchivedWeeks
                .OrderByDescending(a => a.ArchivedAt)
                .ToListAsync();
            return Ok(archives);
        }

        // GET a specific archived week
        [HttpGet("{id}")]
        public async Task<IActionResult> GetArchive(int id)
        {
            var archive = await _context.ArchivedWeeks.FindAsync(id);
            
            if (archive == null)
                return NotFound(new { message = "Archive not found" });

            return Ok(archive);
        }

        // POST - Add a new archived week
        [HttpPost]
        public async Task<IActionResult> AddArchive([FromBody] ArchivedWeekDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if this week is already archived (prevent duplicates)
            var existingArchive = await _context.ArchivedWeeks
                .FirstOrDefaultAsync(a => a.StartDate == dto.StartDate && 
                                          a.EndDate == dto.EndDate && 
                                          a.Year == dto.Year);

            if (existingArchive != null)
            {
                // Update existing archive
                existingArchive.AssignmentsJson = dto.AssignmentsJson;
                existingArchive.TutorHoursJson = dto.TutorHoursJson;
                existingArchive.ArchivedAt = DateTime.UtcNow;
            }
            else
            {
                // Create new archive
                var archive = new ArchivedWeek
                {
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    Year = dto.Year,
                    AssignmentsJson = dto.AssignmentsJson,
                    TutorHoursJson = dto.TutorHoursJson,
                    ArchivedAt = DateTime.UtcNow
                };
                _context.ArchivedWeeks.Add(archive);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Week archived successfully" });
        }

        // DELETE - Remove an archived week
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArchive(int id)
        {
            var archive = await _context.ArchivedWeeks.FindAsync(id);

            if (archive == null)
                return NotFound(new { message = "Archive not found" });

            _context.ArchivedWeeks.Remove(archive);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Archive deleted successfully" });
        }

        // DELETE - Clear all archives
        [HttpDelete("clear-all")]
        public async Task<IActionResult> ClearAllArchives()
        {
            var archives = await _context.ArchivedWeeks.ToListAsync();
            _context.ArchivedWeeks.RemoveRange(archives);
            await _context.SaveChangesAsync();
            return Ok(new { message = "All archives cleared" });
        }
    }

    public class ArchivedWeekDto
    {
        public string StartDate { get; set; } = null!;
        public string EndDate { get; set; } = null!;
        public int Year { get; set; }
        public string AssignmentsJson { get; set; } = null!;
        public string TutorHoursJson { get; set; } = null!;
    }
}
