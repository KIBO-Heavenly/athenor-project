using Microsoft.AspNetCore.Mvc;
using athenor_back_end.Data;
using athenor_back_end.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace athenor_back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Authenticated users can view, POST/DELETE handled per-method
    public class TutorColorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TutorColorsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET all tutor colors
        [HttpGet]
        public async Task<IActionResult> GetAllColors()
        {
            var colors = await _context.TutorColors.ToListAsync();
            return Ok(colors);
        }

        // GET color for a specific tutor
        [HttpGet("{tutorName}")]
        public async Task<IActionResult> GetTutorColor(string tutorName)
        {
            var color = await _context.TutorColors
                .FirstOrDefaultAsync(c => c.TutorName == tutorName);
            
            if (color == null)
                return NotFound(new { message = "No color found for this tutor" });

            return Ok(color);
        }

        // POST/PUT - Add or update a tutor's color
        [HttpPost]
        public async Task<IActionResult> SetTutorColor([FromBody] TutorColorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if color already exists for this tutor
            var existingColor = await _context.TutorColors
                .FirstOrDefaultAsync(c => c.TutorName == dto.TutorName);

            if (existingColor != null)
            {
                // Update existing
                existingColor.ColorLight = dto.ColorLight;
                existingColor.ColorDark = dto.ColorDark;
                existingColor.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Create new
                var newColor = new TutorColor
                {
                    TutorName = dto.TutorName,
                    ColorLight = dto.ColorLight,
                    ColorDark = dto.ColorDark,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.TutorColors.Add(newColor);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Color saved successfully" });
        }

        // POST - Bulk save all tutor colors
        [HttpPost("bulk")]
        public async Task<IActionResult> BulkSaveColors([FromBody] List<TutorColorDto> colors)
        {
            foreach (var dto in colors)
            {
                var existingColor = await _context.TutorColors
                    .FirstOrDefaultAsync(c => c.TutorName == dto.TutorName);

                if (existingColor != null)
                {
                    existingColor.ColorLight = dto.ColorLight;
                    existingColor.ColorDark = dto.ColorDark;
                    existingColor.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    var newColor = new TutorColor
                    {
                        TutorName = dto.TutorName,
                        ColorLight = dto.ColorLight,
                        ColorDark = dto.ColorDark,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.TutorColors.Add(newColor);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Saved {colors.Count} colors successfully" });
        }

        // DELETE - Remove a tutor's color
        [HttpDelete("{tutorName}")]
        public async Task<IActionResult> DeleteTutorColor(string tutorName)
        {
            var color = await _context.TutorColors
                .FirstOrDefaultAsync(c => c.TutorName == tutorName);

            if (color == null)
                return NotFound(new { message = "Color not found" });

            _context.TutorColors.Remove(color);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Color deleted successfully" });
        }
    }

    public class TutorColorDto
    {
        public string TutorName { get; set; } = null!;
        public string ColorLight { get; set; } = null!;
        public string ColorDark { get; set; } = null!;
    }
}
