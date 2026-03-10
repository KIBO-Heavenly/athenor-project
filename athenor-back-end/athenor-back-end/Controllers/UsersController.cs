using Microsoft.AspNetCore.Mvc;
using athenor_back_end.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace athenor_back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication for all endpoints
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET all users - excludes ***REMOVED***
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

        // GET single user by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new {
                user.Id,
                user.Email,
                user.FullName,
                user.Role,
                user.ProfilePicture,
                user.OptOutReviews,
                user.IsEmailVerified
            });
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

            // Preserve schedules for collaboration - just remove the user reference
            // The TutorName field keeps the assignment visible in the schedule
            var userSchedules = await _context.Schedules
                .Where(s => s.UserId == id)
                .ToListAsync();
            
            foreach (var schedule in userSchedules)
            {
                schedule.UserId = null; // Unlink from deleted user but preserve the schedule entry
            }

            // Delete reviews for/by this user (reviews are personal, not collaborative)
            var userReviews = await _context.Reviews
                .Where(r => r.TutorId == id)
                .ToListAsync();
            
            if (userReviews.Any())
            {
                _context.Reviews.RemoveRange(userReviews);
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User '{user.FullName ?? user.Email}' has been deleted. Their schedule assignments have been preserved." });
        }

        // PUT update user profile picture
        [HttpPut("{id}/profile-picture")]
        [Authorize] // Users can update their own profile
        public async Task<IActionResult> UpdateProfilePicture(int id, [FromBody] ProfilePictureDto dto)
        {
            // Get current user ID from JWT token
            var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var isAdmin = User.IsInRole("Admin");
            
            // Users can only update their own profile unless they're admin
            if (currentUserId != id && !isAdmin)
                return Forbid();
                
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.ProfilePicture = dto.ProfilePicture;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile picture updated successfully" });
        }

        // PUT update user opt-out status
        [HttpPut("{id}/opt-out")]
        [Authorize] // Users can update their own opt-out status
        public async Task<IActionResult> UpdateOptOut(int id, [FromBody] OptOutDto dto)
        {
            // Get current user ID from JWT token
            var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var isAdmin = User.IsInRole("Admin");
            
            // Users can only update their own settings unless they're admin
            if (currentUserId != id && !isAdmin)
                return Forbid();
                
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
