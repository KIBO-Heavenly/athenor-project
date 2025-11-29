//using Microsoft.EntityFrameworkCore.Infrastructure;
//using Microsoft.EntityFrameworkCore.Migrations;
using athenor_back_end.Data;
using athenor_back_end.Models;
using AthenorBackEnd.Helpers;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseInMemoryDatabase("AthenorDb")); // For testing
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

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // admin
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

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.MapControllers();
app.Run();
