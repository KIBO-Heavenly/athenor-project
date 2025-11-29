using Microsoft.AspNetCore.Mvc;
using athenor_back_end.Data;
using athenor_back_end.Models;
using AthenorBackEnd.DTOs;
using AthenorBackEnd.Helpers;
using Microsoft.EntityFrameworkCore;

namespace athenor_back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // Database context reference
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context; // Assign injected context
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            // Block the system admin email
            if (dto.Email == "Adminathenor@gmail.com")
                return BadRequest(new { message = "This email is reserved for the system administrator." });

            // Block attempts to register with Admin role
            if (dto.Role == "Admin")
                return BadRequest(new { message = "Admin registration is not allowed." });

            // Check if the email already exists
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { message = "Email already exists" });

            // Force role to Tutor
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = PasswordHelper.HashPassword(dto.Password),
                Role = "Tutor"
            };

            // Save user in the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tutor registered successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            // Hash the incoming password
            var hashed = PasswordHelper.HashPassword(dto.Password);

            // Validate user credentials
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == dto.Email && u.PasswordHash == hashed);

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            // Return login result
            return Ok(new { message = "Login successful", role = user.Role });
        }
    }
}
