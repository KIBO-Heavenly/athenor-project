using athenor_back_end.Models;

namespace AthenorBackEnd.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        int? ValidateToken(string token);
    }
}
