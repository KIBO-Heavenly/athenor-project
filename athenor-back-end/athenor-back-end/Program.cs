using athenor_back_end.Data;
using athenor_back_end.Models;
using AthenorBackEnd.Helpers;
using AthenorBackEnd.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AspNetCoreRateLimit;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Configure Database - use SQLite for better performance on free tier
// On Azure App Service, /home is persistent storage that survives restarts and redeployments
// Locally, we use a local file in the project directory
string dbPath;

// Detect Azure App Service by checking for WEBSITE_SITE_NAME environment variable
// This is more reliable than IsProduction() which requires ASPNETCORE_ENVIRONMENT to be set
var isAzure = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME"));

if (isAzure)
{
    // Azure App Service persistent storage - /home survives redeployments
    var homeDir = Environment.GetEnvironmentVariable("HOME") ?? "/home";
    var dataDir = Path.Combine(homeDir, "data");
    Directory.CreateDirectory(dataDir); // Ensure directory exists
    dbPath = Path.Combine(dataDir, "athenor.db");
    Console.WriteLine($"[AZURE] Using SQLite database at: {dbPath}");
    Console.WriteLine($"[AZURE] WEBSITE_SITE_NAME: {Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME")}");
}
else
{
    // Local development - use project directory
    dbPath = Path.Combine(Directory.GetCurrentDirectory(), "athenor.db");
    Console.WriteLine($"[DEV] Using SQLite database at: {dbPath}");
}

var connectionString = $"Data Source={dbPath}";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

// Register services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IJwtService, JwtService>();

// Configure Memory Cache for Rate Limiting
builder.Services.AddMemoryCache();

// Configure Rate Limiting
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests = false;
    options.HttpStatusCode = 429;
    options.RealIpHeader = "X-Real-IP";
    options.ClientIdHeader = "X-ClientId";
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "POST:/api/Auth/login",
            Period = "1m",
            Limit = 10 // 10 login attempts per minute (allows retries during cold start)
        },
        new RateLimitRule
        {
            Endpoint = "POST:/api/Auth/register",
            Period = "1h",
            Limit = 3 // 3 registrations per hour
        },
        new RateLimitRule
        {
            Endpoint = "POST:/api/Auth/forgot-password",
            Period = "1h",
            Limit = 3 // 3 password reset requests per hour
        },
        new RateLimitRule
        {
            Endpoint = "POST:/api/Reviews",
            Period = "1h",
            Limit = 10 // 10 reviews per hour per IP (prevent spam)
        },
        new RateLimitRule
        {
            Endpoint = "GET:/api/Reviews/*",
            Period = "1m",
            Limit = 30 // 30 review fetches per minute
        },
        new RateLimitRule
        {
            Endpoint = "*",
            Period = "1m",
            Limit = 60 // 60 requests per minute for all other endpoints
        }
    };
});

builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// Configure JWT Authentication
var jwtSecret = builder.Configuration["JwtSettings:Secret"] 
    ?? Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? throw new InvalidOperationException("JWT Secret must be configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "AthenorAPI",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "AthenorClient",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("TutorOrAdmin", policy => policy.RequireRole("Tutor", "Admin"));
});

// Configure CORS for Azure Static Web Apps - Tightened Security
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "https://orange-coast-00030e91e.3.azurestaticapps.net",
            "https://lemon-river-083896710.3.azurestaticapps.net",
            "https://kind-smoke-0cd0b391e.3.azurestaticapps.net"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials() // Enable credentials for JWT tokens
        .WithExposedHeaders("Authorization"); // Expose Authorization header
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Athenor API", 
        Version = "v1",
        Description = "Secure API for Athenor Tutoring System"
    });
    
    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Security Headers Middleware
app.Use(async (context, next) =>
{
    // HSTS - HTTP Strict Transport Security (force HTTPS for 1 year)
    context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    
    // Prevent clickjacking
    context.Response.Headers["X-Frame-Options"] = "DENY";
    
    // Prevent MIME type sniffing
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    
    // XSS Protection (legacy but still useful)
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    
    // Content Security Policy
    context.Response.Headers["Content-Security-Policy"] = 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https://kind-smoke-0cd0b391e.3.azurestaticapps.net https://lemon-river-083896710.3.azurestaticapps.net https://orange-coast-00030e91e.3.azurestaticapps.net";
    
    // Referrer Policy
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    
    // Permissions Policy (formerly Feature Policy)
    context.Response.Headers["Permissions-Policy"] = 
        "camera=(), microphone=(), geolocation=(), interest-cohort=()";

    await next();
});

// Enable IP Rate Limiting
app.UseIpRateLimiting();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // In production, redirect all HTTP to HTTPS
    app.UseHsts();
}

// Seed admin user
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    
    // Apply migrations automatically (both dev and production)
    // For SQLite in dev, this creates the database file if it doesn't exist
    context.Database.Migrate();
    
    // Read admin credentials from configuration
    var adminEmail = configuration["AdminSettings:Email"];
    var adminPassword = configuration["AdminSettings:Password"];

    // Seed admin user
    if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword) &&
        !context.Users.Any(u => u.Email == adminEmail))
    {
        var adminUser = new User
        {
            Email = adminEmail,
            PasswordHash = PasswordHelper.HashPassword(adminPassword),
            FullName = "Athenor Admin",
            Role = "Admin",
            IsEmailVerified = true, // Admin is pre-verified
            ProfilePicture = "athenor-male-pfp" // Default profile picture for admin
        };
        context.Users.Add(adminUser);
        context.SaveChanges();
    }
    else if (!string.IsNullOrEmpty(adminEmail))
    {
        // Ensure existing admin has a profile picture and correct full name
        var existingAdmin = context.Users.FirstOrDefault(u => u.Email == adminEmail);
        if (existingAdmin != null)
        {
            bool needsSave = false;
            
            // Reset profile picture if it's a large base64 string (causes localStorage issues)
            if (string.IsNullOrEmpty(existingAdmin.ProfilePicture) || 
                (existingAdmin.ProfilePicture.StartsWith("data:") && existingAdmin.ProfilePicture.Length > 1000))
            {
                existingAdmin.ProfilePicture = "athenor-male-pfp";
                needsSave = true;
                Console.WriteLine("✅ Reset admin profile picture to default (was too large)");
            }
            
            // Always ensure FullName is set
            if (string.IsNullOrEmpty(existingAdmin.FullName) || existingAdmin.FullName != "Athenor Admin")
            {
                existingAdmin.FullName = "Athenor Admin";
                needsSave = true;
                Console.WriteLine("✅ Set admin FullName to 'Athenor Admin'");
            }
            
            if (needsSave)
            {
                context.SaveChanges();
                Console.WriteLine("✅ Updated admin user with default profile picture and name");
            }
            else
            {
                Console.WriteLine("ℹ️ Admin user already has correct profile picture and name");
            }
        }
    }

    // Auto-verify existing unverified users if SMTP is not configured
    var smtpUser = configuration["Email:SmtpUser"];
    if (string.IsNullOrEmpty(smtpUser))
    {
        var unverifiedUsers = context.Users.Where(u => !u.IsEmailVerified).ToList();
        if (unverifiedUsers.Any())
        {
            Console.WriteLine($"⚠️ SMTP not configured - Auto-verifying {unverifiedUsers.Count} existing unverified user(s):");
            foreach (var user in unverifiedUsers)
            {
                user.IsEmailVerified = true;
                Console.WriteLine($"   ✅ Verified: {user.Email}");
            }
            context.SaveChanges();
            Console.WriteLine("All existing users are now verified and can login.");
        }
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Authentication must come before Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
