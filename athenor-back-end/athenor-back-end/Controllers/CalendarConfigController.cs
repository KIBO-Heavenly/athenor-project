using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using athenor_back_end.Data;
using athenor_back_end.Models;

namespace athenor_back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CalendarConfigController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CalendarConfigController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/CalendarConfig
        [HttpGet]
        public async Task<ActionResult<CalendarConfig>> GetCalendarConfig()
        {
            var config = await _context.CalendarConfigs.FirstOrDefaultAsync(c => c.ConfigKey == "default");
            
            if (config == null)
            {
                // Return default configuration if none exists
                return Ok(new CalendarConfig
                {
                    ConfigKey = "default",
                    TimeSlotsJson = "[\"10:00 – 10:30 AM\",\"10:30 – 11:00 AM\",\"11:00 – 11:30 AM\",\"11:30 – 12:00 PM\",\"12:00 – 12:30 PM\",\"12:30 – 1:00 PM\",\"1:00 – 1:30 PM\",\"1:30 – 2:00 PM\",\"2:00 – 2:30 PM\",\"2:30 – 3:00 PM\",\"3:00 – 3:30 PM\",\"3:30 – 4:00 PM\",\"4:00 – 4:30 PM\",\"4:30 – 5:00 PM\",\"5:00 – 5:30 PM\",\"5:30 – 6:00 PM\",\"6:00 – 6:30 PM\",\"6:30 – 7:00 PM\"]",
                    DaysJson = "[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\"]"
                });
            }

            return Ok(config);
        }

        // PUT: api/CalendarConfig
        [HttpPut]
        public async Task<ActionResult<CalendarConfig>> UpdateCalendarConfig([FromBody] CalendarConfigUpdateDto dto)
        {
            if (string.IsNullOrEmpty(dto.TimeSlotsJson) || string.IsNullOrEmpty(dto.DaysJson))
            {
                return BadRequest("TimeSlotsJson and DaysJson are required");
            }

            var config = await _context.CalendarConfigs.FirstOrDefaultAsync(c => c.ConfigKey == "default");
            
            if (config == null)
            {
                // Create new configuration
                config = new CalendarConfig
                {
                    ConfigKey = "default",
                    TimeSlotsJson = dto.TimeSlotsJson,
                    DaysJson = dto.DaysJson,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.CalendarConfigs.Add(config);
            }
            else
            {
                // Update existing configuration
                config.TimeSlotsJson = dto.TimeSlotsJson;
                config.DaysJson = dto.DaysJson;
                config.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(config);
        }
    }

    public class CalendarConfigUpdateDto
    {
        public string TimeSlotsJson { get; set; } = null!;
        public string DaysJson { get; set; } = null!;
    }
}
