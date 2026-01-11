using Microsoft.AspNetCore.Mvc;
using athenor_back_end.Data;
using athenor_back_end.Models;
using AthenorBackEnd.DTOs;
using AthenorBackEnd.Helpers;
using AthenorBackEnd.Services;
using Microsoft.EntityFrameworkCore;

namespace athenor_back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // Database context reference
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private static readonly string[] _allowedEmailDomains = { "@tamucc.edu", "@islander.tamucc.edu" };

        public AuthController(ApplicationDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        private bool IsUniversityEmail(string email)
        {
            return _allowedEmailDomains.Any(domain => email.EndsWith(domain, StringComparison.OrdinalIgnoreCase));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            // Block ***REMOVED*** from registering
            if (dto.Email.Equals("***REMOVED***", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "This email cannot be registered" });

            // Validate university email
            if (!IsUniversityEmail(dto.Email))
                return BadRequest(new { message = "Only university email addresses (@tamucc.edu or @islander.tamucc.edu) are allowed" });

            // Check if the email already exists
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { message = "Email already exists" });

            // Generate verification token
            var verificationToken = Guid.NewGuid().ToString();

            // Force role to Tutor
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = PasswordHelper.HashPassword(dto.Password),
                Role = "Tutor",
                IsEmailVerified = false,
                EmailVerificationToken = verificationToken,
                EmailVerificationExpiry = DateTime.UtcNow.AddHours(24)
            };

            // Save user in the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send verification email (wrapped in try-catch to not block registration)
            try
            {
                var verificationLink = $"https://kind-smoke-0cd0b391e.3.azurestaticapps.net/verify-email?token={verificationToken}";
                await _emailService.SendEmailAsync(
                    user.Email,
                    "Verify Your Email - Athenor",
                    $"Please verify your email by clicking this link: {verificationLink}"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send verification email: {ex.Message}");
                // Continue anyway - user is registered
            }

            return Ok(new { 
                message = "Registration successful! Please check your email to verify your account.",
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                role = user.Role
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            
            // Always return success to prevent email enumeration
            if (user == null)
                return Ok(new { message = "If the email exists, a password reset link has been sent." });

            // Generate reset token
            var resetToken = Guid.NewGuid().ToString("N");
            user.PasswordResetToken = resetToken;
            user.PasswordResetExpiry = DateTime.UtcNow.AddHours(1);
            
            await _context.SaveChangesAsync();

            try
            {
                var frontendUrl = _configuration["FrontendUrl"] ?? "https://lemon-river-083896710.3.azurestaticapps.net";
                await _emailService.SendPasswordResetEmailAsync(dto.Email, resetToken, frontendUrl);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send password reset email: {ex.Message}");
            }

            return Ok(new { message = "If the email exists, a password reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => 
                u.PasswordResetToken == dto.Token && 
                u.PasswordResetExpiry > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { message = "Invalid or expired reset token." });

            // Update password
            user.PasswordHash = PasswordHelper.HashPassword(dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetExpiry = null;
            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully! You can now log in with your new password." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            Console.WriteLine($"Login attempt for {dto.Email}");
            // DEMO MODE: Always allow admin login
            if (dto.Email == "***REMOVED***" && dto.Password == "***REMOVED***")
            {
                Console.WriteLine("Admin login");
                var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "***REMOVED***");
                if (adminUser == null)
                {
                    // Create admin if missing
                    adminUser = new User
                    {
                        Email = "***REMOVED***",
                        PasswordHash = PasswordHelper.HashPassword("***REMOVED***"),
                        FullName = "Athenor Admin",
                        Role = "Admin",
                        IsEmailVerified = true
                    };
                    _context.Users.Add(adminUser);
                    await _context.SaveChangesAsync();
                }
                return Ok(new {
                    message = "Demo login successful",
                    id = adminUser.Id,
                    email = adminUser.Email,
                    fullName = adminUser.FullName,
                    role = adminUser.Role,
                    profilePicture = adminUser.ProfilePicture,
                    optOutReviews = adminUser.OptOutReviews
                });
            }
            Console.WriteLine("Checking user exists");
            // First check if user exists at all
            var userExists = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            
            if (userExists == null)
            {
                Console.WriteLine("User not found");
                return Unauthorized(new { message = "No account found with this email. Please sign up first.", errorType = "not_found" });
            }
            Console.WriteLine("User found, hashing password");
            // Hash the incoming password
            var hashed = PasswordHelper.HashPassword(dto.Password);

            Console.WriteLine("Checking password");
            // Check if password is correct
            if (userExists.PasswordHash != hashed)
            {
                Console.WriteLine("Wrong password");
                return Unauthorized(new { message = "Incorrect password. Please try again.", errorType = "wrong_password" });
            }

            Console.WriteLine("Checking verification");
            // Check if email is verified
            if (!userExists.IsEmailVerified)
            {
                Console.WriteLine("Not verified");
                return Unauthorized(new { message = "Please verify your email before logging in", errorType = "not_verified" });
            }

            Console.WriteLine("Login successful");
            // Return login result with user info including profile picture
            return Ok(new { 
                message = "Login successful", 
                id = userExists.Id,
                email = userExists.Email,
                fullName = userExists.FullName,
                role = userExists.Role,
                profilePicture = userExists.ProfilePicture,
                optOutReviews = userExists.OptOutReviews
            });
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == token);
            
            if (user == null)
                return BadRequest(new { message = "Invalid verification token" });

            if (user.EmailVerificationExpiry < DateTime.UtcNow)
                return BadRequest(new { message = "Verification token has expired" });

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationExpiry = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Email verified successfully" });
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (user.IsEmailVerified)
                return BadRequest(new { message = "Email already verified" });

            // Generate new verification token
            var verificationToken = Guid.NewGuid().ToString();
            user.EmailVerificationToken = verificationToken;
            user.EmailVerificationExpiry = DateTime.UtcNow.AddHours(24);

            await _context.SaveChangesAsync();

            // Send verification email (wrapped in try-catch)
            try
            {
                var verificationLink = $"https://kind-smoke-0cd0b391e.3.azurestaticapps.net/verify-email?token={verificationToken}";
                await _emailService.SendEmailAsync(
                    user.Email,
                    "Verify Your Email - Athenor",
                    $"Please verify your email by clicking this link: {verificationLink}"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send verification email: {ex.Message}");
            }

            return Ok(new { message = "Verification email sent" });
        }
    }
}
