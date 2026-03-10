# Athenor Security Setup Guide

## Quick Start

### 1. Generate JWT Secret
Run this in PowerShell to generate a secure 64-character secret:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

### 2. Configure Secrets

#### Option A: User Secrets (Development)
```bash
cd athenor-back-end/athenor-back-end
dotnet user-secrets init
dotnet user-secrets set "JwtSettings:Secret" "YOUR_GENERATED_SECRET"
dotnet user-secrets set "Email:SmtpUser" "your-email@gmail.com"
dotnet user-secrets set "Email:SmtpPass" "your-app-password"
```

#### Option B: Environment Variables (Production - Azure)
In Azure Portal → App Service → Configuration → Application Settings:
```
JWT_SECRET = your_generated_secret
JWT_ISSUER = AthenorAPI
JWT_AUDIENCE = AthenorClient
JWT_EXPIRY_MINUTES = 60
SMTP_USER = your-email@gmail.com
SMTP_PASS = your-app-password
FRONTEND_URL = https://your-app.azurestaticapps.net
```

### 3. Update Frontend

The login response now includes a JWT token:
```javascript
// Login request (same as before)
const response = await fetch('/api/Auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();

// NEW: Store the token
localStorage.setItem('authToken', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
```

Include the token in all subsequent requests:
```javascript
fetch('/api/Users', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  }
});
```

### 4. Test the Security

```bash
# Build and run
cd athenor-back-end/athenor-back-end
dotnet build
dotnet run
```

Test endpoints:
```bash
# Public endpoint (should work)
curl http://localhost:5000/api/Auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@tamucc.edu","password":"YourPassword123!"}'

# Protected endpoint without token (should return 401)
curl http://localhost:5000/api/Users

# Protected endpoint with token (should work)
curl http://localhost:5000/api/Users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## What Changed?

### Backend Changes:
1. ✅ **Password hashing**: SHA256 → BCrypt (10,000x stronger)
2. ✅ **Authentication**: Added JWT tokens with expiration
3. ✅ **Authorization**: Role-based access control (Admin, Tutor)
4. ✅ **Rate limiting**: Prevents brute force attacks
5. ✅ **Security headers**: HSTS, CSP, X-Frame-Options, etc.
6. ✅ **Input validation**: Comprehensive validation rules
7. ✅ **Secrets management**: No more hardcoded passwords
8. ✅ **CORS**: Tightened to specific origins only

### Frontend Changes Required:
1. **Store JWT token** after login
2. **Include token** in Authorization header for all API requests
3. **Handle 401 errors** (token expired → redirect to login)
4. **Update registration** password validation (8 chars, uppercase, lowercase, number, special)

## Migration Notes

### Existing Users:
Since we changed from SHA256 to BCrypt, **existing users cannot login** with their old password hashes. You have two options:

#### Option 1: Force Password Reset (Recommended)
```bash
# Send password reset emails to all existing users
# They'll create new BCrypt hashes when they reset
```

#### Option 2: Fresh Start (If Development)
```bash
# Delete the database and start fresh
rm athenor.db
dotnet ef database update
```

### Admin Account:
The default admin account will be recreated automatically on startup:
[credentials stored in appsettings.json] (CHANGE THIS IMMEDIATELY!)

## Troubleshooting

### "JWT Secret not configured"
- Make sure you've set the JWT_SECRET environment variable or user secret
- Check appsettings.json has the JwtSettings section

### "401 Unauthorized" on frontend
- Check that the token is being sent in the Authorization header
- Verify the token hasn't expired (60 minutes)
- Check browser console for errors

### Rate limit errors (429)
- Too many requests from same IP
- Wait 1 minute and try again
- Adjust rate limits in Program.cs if needed

### Migration errors
- Delete the database file and migrations
- Run: `dotnet ef migrations add InitialCreateSecure`
- Run: `dotnet ef database update`

## Security Checklist

Before deploying to production:
- [ ] Generate strong JWT secret (64+ characters)
- [ ] Move all secrets to Azure Key Vault or environment variables
- [ ] Change default admin password
- [ ] Test rate limiting
- [ ] Test authorization on all endpoints
- [ ] Verify HTTPS is enforced
- [ ] Enable Application Insights monitoring
- [ ] Set up automated backups
- [ ] Document incident response procedures
- [ ] Train team on security procedures

## Next Steps

1. **Test locally** with the new authentication
2. **Update frontend** to use JWT tokens
3. **Deploy to Azure** with environment variables configured
4. **Force password reset** for existing users
5. **Monitor** for security events

## Support

For questions or issues:
- Review [SECURITY.md](../SECURITY.md) for detailed documentation
- Check logs for error messages
- Test with Swagger UI (includes JWT authentication UI)

---
**Generated**: January 23, 2026
