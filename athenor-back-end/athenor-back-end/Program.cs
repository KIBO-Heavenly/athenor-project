using athenor_back_end.Data;
using athenor_back_end.Models;
using AthenorBackEnd.Helpers;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// -------------------------------------------------------------
// Database (InMemory for testing)
// -------------------------------------------------------------
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseInMemoryDatabase("AthenorDb"));

// -------------------------------------------------------------
// CORS configuration (allow React front-end)
// -------------------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// -------------------------------------------------------------
// Seed only the administrator user (no sample tutors)
// -------------------------------------------------------------
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // Create admin only if missing
    if (!context.Users.Any(u => u.Email == "Adminathenor@gmail.com"))
    {
        context.Users.Add(new User
        {
            FullName = "Administrator",
            Email = "Adminathenor@gmail.com",
            PasswordHash = PasswordHelper.HashPassword("@thernor2025"),
            Role = "Admin"
        });

        context.SaveChanges();
    }
}

// -------------------------------------------------------------
// Swagger UI
// -------------------------------------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Disabled for local development

// -------------------------------------------------------------
// Middleware + Controllers
// -------------------------------------------------------------
app.UseCors("AllowReact");
app.MapControllers();

app.Run();
