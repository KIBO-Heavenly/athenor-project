using System.Net;
using System.Net.Mail;

namespace AthenorBackEnd.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendVerificationEmailAsync(string to, string token, string frontendUrl);
        Task SendPasswordResetEmailAsync(string to, string token, string frontendUrl);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"] ?? "";
            var smtpPass = _configuration["Email:SmtpPass"] ?? "";
            var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@athenor.com";
            var fromName = _configuration["Email:FromName"] ?? "Athenor";

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(to);

            await client.SendMailAsync(mailMessage);
        }

        public async Task SendVerificationEmailAsync(string to, string token, string frontendUrl)
        {
            var verifyUrl = $"{frontendUrl}/verify-email?token={token}";
            var subject = "Verify Your Email - Athenor";
            var body = $@"
                <html>
                <body style=""font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 20px;"">
                    <div style=""max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"">
                        <div style=""text-align: center; margin-bottom: 30px;"">
                            <h1 style=""color: #059669; margin: 0;"">Athenor</h1>
                            <p style=""color: #64748b; margin: 5px 0 0 0;"">Tutoring Management System</p>
                        </div>
                        
                        <h2 style=""color: #1f2937; text-align: center;"">Verify Your Email</h2>
                        <p style=""color: #4b5563; text-align: center; line-height: 1.6;"">
                            Thank you for registering with Athenor. Please click the button below to verify your email address.
                        </p>
                        
                        <div style=""text-align: center; margin: 30px 0;"">
                            <a href=""{verifyUrl}"" style=""background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;"">Verify Email</a>
                        </div>
                        
                        <div style=""background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;"">
                            <p style=""color: #6b7280; font-size: 14px; margin: 0 0 10px 0;"">If the button doesn't work, copy and paste this link:</p>
                            <p style=""color: #0891b2; font-size: 12px; word-break: break-all; margin: 0;"">{verifyUrl}</p>
                        </div>
                        
                        <p style=""color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;"">
                            This link will expire in 24 hours. If you didn't request this, please ignore this email.
                        </p>
                        
                        <div style=""text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;"">
                            <p style=""color: #9ca3af; font-size: 12px; margin: 0;"">© 2025 Athenor - Texas A&M University Corpus Christi</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(to, subject, body);
        }

        public async Task SendPasswordResetEmailAsync(string to, string token, string frontendUrl)
        {
            var resetUrl = $"{frontendUrl}/reset-password?token={token}";
            var subject = "Reset Your Athenor Password";
            var body = $@"
                <html>
                <body style=""font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 20px;"">
                    <div style=""max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"">
                        <div style=""text-align: center; margin-bottom: 30px;"">
                            <h1 style=""color: #059669; margin: 0;"">Athenor</h1>
                            <p style=""color: #64748b; margin: 5px 0 0 0;"">Tutoring Management System</p>
                        </div>
                        
                        <h2 style=""color: #1f2937; text-align: center;"">Password Reset Request</h2>
                        <p style=""color: #4b5563; text-align: center; line-height: 1.6;"">
                            We received a request to reset your password. Click the button below to create a new password.
                        </p>
                        
                        <div style=""text-align: center; margin: 30px 0;"">
                            <a href=""{resetUrl}"" style=""background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;"">Reset Password</a>
                        </div>
                        
                        <div style=""background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;"">
                            <p style=""color: #6b7280; font-size: 14px; margin: 0 0 10px 0;"">If the button doesn't work, copy and paste this link:</p>
                            <p style=""color: #0891b2; font-size: 12px; word-break: break-all; margin: 0;"">{resetUrl}</p>
                        </div>
                        
                        <p style=""color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;"">
                            This link will expire in 1 hour. If you didn't request this, please ignore this email.
                        </p>
                        
                        <div style=""text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;"">
                            <p style=""color: #9ca3af; font-size: 12px; margin: 0;"">© 2025 Athenor - Texas A&M University Corpus Christi</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(to, subject, body);
        }
    }
}
