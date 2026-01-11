using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using athenor_back_end.Models;

namespace athenor_back_end.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> opts) : base(opts) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Schedule> Schedules => Set<Schedule>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<TutorAvailability> TutorAvailabilities => Set<TutorAvailability>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            
            // Configure Review -> User relationship
            builder.Entity<Review>()
                .HasOne(r => r.Tutor)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.TutorId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    // Design-time factory for migrations
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            
            // Use SQL Server for migrations (connection string will be replaced in Azure)
            optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=AthenorDb;Trusted_Connection=true;");
            
            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
