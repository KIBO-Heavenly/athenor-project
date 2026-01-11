# Athenor Backend

This is the backend API for the Athenor tutoring management system, built with ASP.NET Core 7.0.

## 🏗️ Architecture

- **Framework:** ASP.NET Core 7.0 Web API
- **Database:** SQL Server with Entity Framework Core
- **Authentication:** JWT Bearer tokens
- **Email Service:** SMTP integration for notifications

## 📁 Project Structure

```
athenor-back-end/
├── Controllers/           # API endpoint controllers
│   ├── AuthController.cs           # Authentication & authorization
│   ├── UsersController.cs          # User management (Admin)
│   ├── ScheduleController.cs       # Schedule CRUD operations
│   ├── ReviewsController.cs        # Student review system
│   ├── TutorAvailabilityController.cs  # Tutor availability
│   └── DataImportController.cs     # Bulk data import
├── Models/               # Database entity models
│   ├── User.cs                    # User entity
│   ├── Schedule.cs                # Schedule entity
│   ├── Review.cs                  # Review entity
│   └── TutorAvailability.cs       # Availability entity
├── Data/                 # Database context
│   └── ApplicationDbContext.cs    # EF Core DbContext
├── DTOs/                 # Data Transfer Objects
│   ├── LoginDto.cs
│   ├── RegisterDto.cs
│   └── ScheduleDto.cs
├── Services/             # Business logic services
│   └── EmailService.cs            # Email sending logic
├── Helpers/              # Utility functions
│   └── PasswordHelper.cs          # Password hashing
└── Migrations/           # EF Core database migrations
```

## 🚀 Getting Started

### Prerequisites

- [.NET SDK 7.0+](https://dotnet.microsoft.com/download)
- SQL Server (local or Azure SQL Database)
- SMTP server credentials

### Configuration

1. **Database Connection**
   
   Copy `appsettings.example.json` to `appsettings.json`:
   ```bash
   cp appsettings.example.json appsettings.json
   ```
   
   Update the connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=YOUR_SERVER;Database=athenor_db;..."
     }
   }
   ```

2. **Email Settings**
   
   Copy `email-settings.example.json` to `email-settings.json`:
   ```bash
   cp email-settings.example.json email-settings.json
   ```
   
   Update with your SMTP credentials.

3. **Run Migrations**
   ```bash
   dotnet ef database update
   ```

4. **Start the Server**
   ```bash
   dotnet run
   ```
   
   API will be available at `https://localhost:7XXX`

## 📚 API Endpoints

### Authentication (`/api/Auth`)
- `POST /register` - Register new user
- `POST /login` - User login (returns JWT)
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /verify-email` - Verify email address

### Users (`/api/Users`) - Admin Only
- `GET /` - Get all users
- `GET /{id}` - Get user by ID
- `PUT /{id}` - Update user
- `DELETE /{id}` - Delete user

### Schedule (`/api/Schedule`)
- `GET /` - Get all schedules
- `GET /{id}` - Get schedule by ID
- `POST /` - Create schedule (Tutor/Admin)
- `PUT /{id}` - Update schedule
- `DELETE /{id}` - Delete schedule

### Reviews (`/api/Reviews`)
- `GET /` - Get all reviews
- `GET /{id}` - Get review by ID
- `POST /` - Submit review
- `PUT /{id}` - Update review status (Admin)
- `DELETE /{id}` - Delete review (Admin)

### Tutor Availability (`/api/TutorAvailability`)
- `GET /tutor/{tutorId}` - Get tutor availability
- `POST /` - Create availability slot
- `PUT /{id}` - Update availability
- `DELETE /{id}` - Delete availability

## 🔐 Authentication & Authorization

The API uses JWT Bearer tokens for authentication. Include the token in requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Roles
- **Admin** - Full system access
- **Tutor** - Manage own schedule and availability
- **Student** - View schedules, submit reviews

## 🗄️ Database Schema

### Users Table
- Id, Name, Email, PasswordHash, Role, EmailVerified, CreatedAt

### Schedules Table
- Id, TutorName, Course, Day, StartTime, EndTime, Location, UserId

### Reviews Table
- Id, TutorName, Rating, Comment, IsApproved, CreatedAt

### TutorAvailability Table
- Id, UserId, DayOfWeek, StartTime, EndTime, IsAvailable

## 🧪 Testing

Run unit tests:
```bash
dotnet test
```

## 🚢 Deployment

### Azure App Service

1. **Publish Profile**
   ```bash
   dotnet publish -c Release
   ```

2. **Deploy to Azure**
   - Create App Service (Windows, .NET 7)
   - Configure connection strings in Azure Portal
   - Deploy via Azure DevOps or GitHub Actions

### Environment Variables

Set these in your hosting environment:
- `ConnectionStrings__DefaultConnection`
- `Email__SmtpHost`
- `Email__SmtpUser`
- `Email__SmtpPass`
- `FrontendUrl`

## 📝 Notes

- Migrations are tracked in the `Migrations/` folder
- Passwords are hashed using BCrypt
- JWT tokens expire after 60 minutes (configurable)
- CORS is configured to allow frontend origin

## 🔧 Development Tips

```bash
# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Rollback migration
dotnet ef database update PreviousMigrationName

# Watch mode (auto-reload)
dotnet watch run
```

## 📄 License

Part of the Athenor project - see main [LICENSE](../LICENSE)
