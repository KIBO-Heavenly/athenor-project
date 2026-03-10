using Microsoft.EntityFrameworkCore;
using athenor_back_end.Data;
using athenor_back_end.Models;
using AthenorBackEnd.Helpers;

namespace AthenorBackEnd.Migrations
{
    /// <summary>
    /// Migration helper to convert existing SHA256 password hashes to BCrypt
    /// WARNING: This is a one-time migration. All users will need to use their original passwords.
    /// </summary>
    public static class PasswordMigrationHelper
    {
        public static async Task MigratePasswordHashes(ApplicationDbContext context)
        {
            var users = await context.Users.ToListAsync();
            
            foreach (var user in users)
            {
                // Check if password is already BCrypt format (starts with $2a$, $2b$, or $2y$)
                if (user.PasswordHash.StartsWith("$2"))
                {
                    Console.WriteLine($"User {user.Email} already has BCrypt hash, skipping");
                    continue;
                }
                
                // For existing users with SHA256 hashes, we cannot convert them directly
                // because we don't have the original password
                // Options:
                // 1. Force password reset (recommended for security)
                // 2. Keep a mapping of old hashes temporarily
                // 3. Notify users to reset passwords
                
                // For now, we'll mark these accounts for password reset
                Console.WriteLine($"User {user.Email} has old password hash format. Marking for password reset.");
                
                // Generate a password reset token
                user.PasswordResetToken = Guid.NewGuid().ToString();
                user.PasswordResetExpiry = DateTime.UtcNow.AddDays(30); // 30 days to reset
                
                // Optional: Temporarily invalidate the account until password is reset
                // user.IsEmailVerified = false; // Uncomment to force reset
            }
            
            await context.SaveChangesAsync();
            Console.WriteLine("Password migration check complete.");
        }
    }
}
