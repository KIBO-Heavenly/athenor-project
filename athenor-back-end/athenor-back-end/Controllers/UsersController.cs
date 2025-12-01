using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using athenor_back_end.Data;
using athenor_back_end.Models;
using AthenorBackEnd.Helpers;

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

        // GET: api/Users/tutors
        [HttpGet("tutors")]
        public async Task<IActionResult> GetTutors()
        {
            var tutors = await _context.Users
                .Where(u => u.Role == "Tutor")
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email
                })
                .ToListAsync();

            return Ok(tutors);
        }

        // DELETE: api/Users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTutor(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound(new { message = "User not found." });

            if (user.Role == "Admin")
                return BadRequest(new { message = "Admin cannot be deleted." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tutor deleted successfully." });
        }

        // PUT: api/Users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTutor(int id, [FromBody] User updatedUser)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound(new { message = "User not found." });

            if (user.Role == "Admin")
                return BadRequest(new { message = "Admin cannot be edited." });

            // Update name
            if (!string.IsNullOrWhiteSpace(updatedUser.FullName))
                user.FullName = updatedUser.FullName;

            // Update email
            if (!string.IsNullOrWhiteSpace(updatedUser.Email))
                user.Email = updatedUser.Email;

            // Update password (plain text received in PasswordHash field)
            if (!string.IsNullOrWhiteSpace(updatedUser.PasswordHash))
                user.PasswordHash = PasswordHelper.HashPassword(updatedUser.PasswordHash);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Tutor updated successfully." });
        }
    }
}
