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
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IJwtService _jwtService;
        private static readonly string[] _allowedEmailDomains = { "@tamucc.edu", "@islander.tamucc.edu" };

        public AuthController(
            ApplicationDbContext context, 
            IEmailService emailService, 
            IConfiguration configuration,
            IJwtService jwtService)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
            _jwtService = jwtService;
        }

        private bool IsUniversityEmail(string email)
        {
            return _allowedEmailDomains.Any(domain => email.EndsWith(domain, StringComparison.OrdinalIgnoreCase));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            try
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

                // Randomly assign a profile picture (male or female avatar)
                var random = new Random();
                var randomAvatar = random.Next(2) == 0 ? "athenor-male-pfp" : "athenor-female-pfp";

                // Check if email verification should be skipped (when SMTP is not configured)
                var smtpUser = _configuration["Email:SmtpUser"];
                var skipEmailVerification = string.IsNullOrEmpty(smtpUser);

                // Force role to Tutor
                var user = new User
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    PasswordHash = PasswordHelper.HashPassword(dto.Password),
                    Role = "Tutor",
                    ProfilePicture = randomAvatar,
                    IsEmailVerified = skipEmailVerification, // Auto-verify if SMTP not configured
                    EmailVerificationToken = verificationToken,
                    EmailVerificationExpiry = DateTime.UtcNow.AddHours(24)
                };

                // Save user in the database
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                Console.WriteLine($"User registered successfully: {user.Email}");

                // Send verification email (fire-and-forget for faster response)
                if (!skipEmailVerification)
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var frontendUrl = _configuration["FrontendUrl"] ?? "https://kind-smoke-0cd0b391e.3.azurestaticapps.net";
                            await _emailService.SendVerificationEmailAsync(user.Email, verificationToken, frontendUrl);
                            Console.WriteLine($"Verification email sent to {user.Email}");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Failed to send verification email: {ex.Message}");
                        }
                    });
                }
                else
                {
                    Console.WriteLine($"⚠️ Email verification skipped - SMTP not configured. User auto-verified.");
                }

                var message = skipEmailVerification 
                    ? "Registration successful! You can now log in." 
                    : "Registration successful! Please check your email to verify your account.";

                return Ok(new { 
                    message = message,
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName,
                    role = user.Role
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Registration error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = $"Registration failed: {ex.Message}" });
            }
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
                var frontendUrl = _configuration["FrontendUrl"] ?? "https://kind-smoke-0cd0b391e.3.azurestaticapps.net";
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
            // Validate input
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Email and password are required" });

            Console.WriteLine($"Login attempt for {dto.Email}");
            
            // Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            
            if (user == null)
            {
                Console.WriteLine("User not found");
                // Use generic error message to prevent email enumeration
                return Unauthorized(new { message = "Invalid email or password", errorType = "invalid_credentials" });
            }

            Console.WriteLine("User found, verifying password");
            
            // Verify password using BCrypt (constant-time comparison)
            if (!PasswordHelper.VerifyPassword(dto.Password, user.PasswordHash))
            {
                Console.WriteLine("Wrong password");
                // Use generic error message to prevent timing attacks
                return Unauthorized(new { message = "Invalid email or password", errorType = "invalid_credentials" });
            }

            Console.WriteLine("Password correct, checking verification");
            
            // Check if email is verified
            if (!user.IsEmailVerified)
            {
                Console.WriteLine("Email not verified");
                return Unauthorized(new { message = "Please verify your email before logging in", errorType = "not_verified" });
            }

            Console.WriteLine("Login successful, generating JWT token");
            
            // Generate JWT token
            var token = _jwtService.GenerateToken(user);
            
            // Return success with JWT token
            return Ok(new { 
                message = "Login successful",
                token = token, // JWT token for authentication
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName,
                    role = user.Role,
                    profilePicture = user.ProfilePicture,
                    optOutReviews = user.OptOutReviews
                }
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

            // Send verification email (fire-and-forget for faster response)
            _ = Task.Run(async () =>
            {
                try
                {
                    var frontendUrl = _configuration["FrontendUrl"] ?? "https://kind-smoke-0cd0b391e.3.azurestaticapps.net";
                    await _emailService.SendVerificationEmailAsync(user.Email, verificationToken, frontendUrl);
                    Console.WriteLine($"Resend verification email sent to {user.Email}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send verification email: {ex.Message}");
                }
            });

            return Ok(new { message = "Verification email sent" });
        }
    }
}
