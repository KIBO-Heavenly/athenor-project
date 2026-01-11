using Microsoft.AspNetCore.Mvc;
using athenor_back_end.Data;
using Microsoft.EntityFrameworkCore;

namespace athenor_back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET all users (for admin) - excludes ***REMOVED***
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Where(u => u.Email != "***REMOVED***")
                .Select(u => new {
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.Role,
                    u.ProfilePicture,
                    u.IsEmailVerified,
                    CreatedAt = DateTime.UtcNow // We don't have this field yet, but placeholder
                })
                .OrderBy(u => u.Role)
                .ThenBy(u => u.FullName)
                .ToListAsync();

            return Ok(users);
        }

        // GET user count (excludes ***REMOVED***)
        [HttpGet("count")]
        public async Task<IActionResult> GetUserCount()
        {
            var totalUsers = await _context.Users.CountAsync(u => u.Email != "***REMOVED***");
            var tutors = await _context.Users.CountAsync(u => u.Role == "Tutor");
            var admins = await _context.Users.CountAsync(u => u.Role == "Admin" && u.Email != "***REMOVED***");
            var verified = await _context.Users.CountAsync(u => u.IsEmailVerified && u.Email != "***REMOVED***");
            var unverified = await _context.Users.CountAsync(u => !u.IsEmailVerified && u.Email != "***REMOVED***");

            return Ok(new { 
                total = totalUsers, 
                tutors,
                admins,
                verified,
                unverified
            });
        }

        // DELETE user by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Also delete any schedules associated with this user
            var userSchedules = await _context.Schedules
                .Where(s => s.UserId == id)
                .ToListAsync();
            
            if (userSchedules.Any())
            {
                _context.Schedules.RemoveRange(userSchedules);
            }

            // Also delete any reviews by or for this user
            var userReviews = await _context.Reviews
                .Where(r => r.TutorId == id)
                .ToListAsync();
            
            if (userReviews.Any())
            {
                _context.Reviews.RemoveRange(userReviews);
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User '{user.FullName ?? user.Email}' has been deleted." });
        }

        // PUT update user profile picture
        [HttpPut("{id}/profile-picture")]
        public async Task<IActionResult> UpdateProfilePicture(int id, [FromBody] ProfilePictureDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.ProfilePicture = dto.ProfilePicture;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile picture updated successfully" });
        }

        // PUT update user opt-out status
        [HttpPut("{id}/opt-out")]
        public async Task<IActionResult> UpdateOptOut(int id, [FromBody] OptOutDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.OptOutReviews = dto.OptOutReviews;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Opt-out status updated successfully" });
        }
    }

    public class ProfilePictureDto
    {
        public string ProfilePicture { get; set; } = string.Empty;
    }

    public class OptOutDto
    {
        public bool OptOutReviews { get; set; }
    }
}
