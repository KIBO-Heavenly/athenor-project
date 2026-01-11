using athenor_back_end.Data;
using athenor_back_end.Models;
using AthenorBackEnd.Helpers;
using AthenorBackEnd.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure Database - use SQL Server for Azure, in-memory for local dev
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (builder.Environment.IsDevelopment())
{
    // Use in-memory database for local development
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseInMemoryDatabase("AthenorDb"));
}
else
{
    // Use Azure SQL Database in production
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString));
}

// Register Email Service
builder.Services.AddScoped<IEmailService, EmailService>();

// Configure CORS for Azure Static Web Apps
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",  // Local development
            "http://localhost:5174",  // Local development (alternate port)
            "http://localhost:5175",  // Local development (alternate port)
            "https://orange-coast-00030e91e.3.azurestaticapps.net",
            "https://lemon-river-083896710.3.azurestaticapps.net",
            "https://kind-smoke-0cd0b391e.3.azurestaticapps.net"
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Seed admin user
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    // Apply migrations automatically on Azure startup
    if (!app.Environment.IsDevelopment())
    {
        context.Database.Migrate();
    }
    
    // Check if admin exists (***REMOVED***)
    if (!context.Users.Any(u => u.Email == "***REMOVED***"))
    {
        var adminUser = new User
        {
            Email = "***REMOVED***",
            PasswordHash = PasswordHelper.HashPassword("***REMOVED***"),
            FullName = "Athenor Admin",
            Role = "Admin",
            IsEmailVerified = true // Admin is pre-verified
        };
        context.Users.Add(adminUser);
        context.SaveChanges();
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();
