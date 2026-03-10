using System.Security.Cryptography;
using System.Text;

namespace AthenorBackEnd.Helpers
{
    public static class PasswordHelper
    {
        /// <summary>
        /// Hashes a password using BCrypt with automatic salt generation
        /// </summary>
        public static string HashPassword(string password)
        {
            // Use BCrypt with work factor 12 (good balance of security and performance)
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        }

        /// <summary>
        /// Verifies a password against a BCrypt hash using constant-time comparison
        /// </summary>
        public static bool VerifyPassword(string password, string hash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch
            {
                // Return false if hash is invalid format
                return false;
            }
        }
    }
}
