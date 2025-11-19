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
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { message = "Email already exists" });

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = PasswordHelper.HashPassword(dto.Password),
                FullName = dto.FullName,
                Role = dto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var hashed = PasswordHelper.HashPassword(dto.Password);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.PasswordHash == hashed);

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            return Ok(new { message = "Login successful", role = user.Role });
        }
    }
}
