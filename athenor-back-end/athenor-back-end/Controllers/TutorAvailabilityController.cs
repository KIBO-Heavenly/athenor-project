using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using athenor_back_end.Data;
using athenor_back_end.Models;

namespace athenor_back_end.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TutorAvailabilityController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TutorAvailabilityController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/TutorAvailability
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TutorAvailability>>> GetAllTutorAvailabilities()
        {
            return await _context.TutorAvailabilities.ToListAsync();
        }

        // GET: api/TutorAvailability/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TutorAvailability>> GetTutorAvailability(int id)
        {
            var availability = await _context.TutorAvailabilities.FindAsync(id);

            if (availability == null)
            {
                return NotFound();
            }

            return availability;
        }

        // GET: api/TutorAvailability/name/{tutorName}
        [HttpGet("name/{tutorName}")]
        public async Task<ActionResult<TutorAvailability>> GetTutorAvailabilityByName(string tutorName)
        {
            var availability = await _context.TutorAvailabilities
                .FirstOrDefaultAsync(t => t.TutorName == tutorName);

            if (availability == null)
            {
                return NotFound();
            }

            return availability;
        }

        // POST: api/TutorAvailability
        [HttpPost]
        public async Task<ActionResult<TutorAvailability>> CreateTutorAvailability(TutorAvailability availability)
        {
            // Check if tutor already exists
            var existing = await _context.TutorAvailabilities
                .FirstOrDefaultAsync(t => t.TutorName == availability.TutorName);

            if (existing != null)
            {
                return Conflict(new { message = "Tutor availability already exists. Use PUT to update." });
            }

            availability.CreatedAt = DateTime.UtcNow;
            availability.UpdatedAt = DateTime.UtcNow;

            _context.TutorAvailabilities.Add(availability);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTutorAvailability), new { id = availability.Id }, availability);
        }

        // POST: api/TutorAvailability/batch
        [HttpPost("batch")]
        public async Task<ActionResult<object>> CreateBatchTutorAvailability([FromBody] List<TutorAvailability> availabilities)
        {
            if (availabilities == null || availabilities.Count == 0)
            {
                return BadRequest(new { message = "No tutor availabilities provided" });
            }

            var created = 0;
            var updated = 0;
            var errors = new List<string>();

            foreach (var availability in availabilities)
            {
                try
                {
                    // Check if tutor already exists
                    var existing = await _context.TutorAvailabilities
                        .FirstOrDefaultAsync(t => t.TutorName == availability.TutorName);

                    if (existing != null)
                    {
                        // Update existing
                        existing.AvailabilityJson = availability.AvailabilityJson;
                        existing.UpdatedAt = DateTime.UtcNow;
                        updated++;
                    }
                    else
                    {
                        // Create new
                        availability.CreatedAt = DateTime.UtcNow;
                        availability.UpdatedAt = DateTime.UtcNow;
                        _context.TutorAvailabilities.Add(availability);
                        created++;
                    }
                }
                catch (Exception ex)
                {
                    errors.Add($"{availability.TutorName}: {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Batch operation completed",
                created,
                updated,
                errors
            });
        }

        // PUT: api/TutorAvailability/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTutorAvailability(int id, TutorAvailability availability)
        {
            if (id != availability.Id)
            {
                return BadRequest();
            }

            var existing = await _context.TutorAvailabilities.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.TutorName = availability.TutorName;
            existing.AvailabilityJson = availability.AvailabilityJson;
            existing.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TutorAvailabilityExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/TutorAvailability/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTutorAvailability(int id)
        {
            var availability = await _context.TutorAvailabilities.FindAsync(id);
            if (availability == null)
            {
                return NotFound();
            }

            _context.TutorAvailabilities.Remove(availability);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/TutorAvailability/name/{tutorName}
        [HttpDelete("name/{tutorName}")]
        public async Task<IActionResult> DeleteTutorAvailabilityByName(string tutorName)
        {
            var availability = await _context.TutorAvailabilities
                .FirstOrDefaultAsync(t => t.TutorName == tutorName);

            if (availability == null)
            {
                return NotFound();
            }

            _context.TutorAvailabilities.Remove(availability);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/TutorAvailability/clear-all
        [HttpDelete("clear-all")]
        public async Task<IActionResult> ClearAllTutorAvailabilities()
        {
            var allAvailabilities = await _context.TutorAvailabilities.ToListAsync();
            _context.TutorAvailabilities.RemoveRange(allAvailabilities);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Cleared {allAvailabilities.Count} tutor availabilities" });
        }

        private bool TutorAvailabilityExists(int id)
        {
            return _context.TutorAvailabilities.Any(e => e.Id == id);
        }
    }
}
