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
        public DbSet<TutorColor> TutorColors => Set<TutorColor>();
        public DbSet<ArchivedWeek> ArchivedWeeks => Set<ArchivedWeek>();
        public DbSet<CalendarConfig> CalendarConfigs => Set<CalendarConfig>();

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
            
            // Use SQLite for migrations - matches production configuration
            optionsBuilder.UseSqlite("Data Source=athenor.db");
            
            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
