# Athenor - University Tutoring Management System

<div align="center">

![Athenor Logo](https://via.placeholder.com/200x200?text=Athenor)

**A comprehensive web-based platform for managing university tutoring services, schedules, and student reviews.**

[![.NET](https://img.shields.io/badge/.NET-7.0-purple)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Usage](#usage) • [API Documentation](#api-documentation)

</div>

---

## 📋 Overview

Athenor is a full-stack tutoring management system developed as a senior capstone project. The platform was designed to streamline tutor scheduling, student reviews, availability management, and administrative oversight for university tutoring services. Currently deployed and in use at Texas A&M University - Corpus Christi (TAMUCC).

### Key Capabilities

- 🔐 **Secure Authentication** - JWT-based authentication with role-based access control (Admin, Tutor, Student)
- 📅 **Schedule Management** - Dynamic tutor scheduling with conflict detection and availability tracking
- 📝 **Review System** - Anonymous student reviews with moderation capabilities
- 📊 **Admin Dashboard** - Comprehensive admin panel for user management and data import
- 📧 **Email Integration** - Automated email notifications for account verification and password resets
- 📄 **Document Processing** - Bulk import of schedules via Word document parsing

---

## ✨ Features

### For Students
- Browse available tutors and schedules
- View tutor availability in real-time
- Submit anonymous reviews for tutoring sessions
- Request and reset passwords via email

### For Tutors
- Manage personal availability schedules
- Upload and update tutoring schedules
- View assigned courses and time slots
- Track student feedback

### For Administrators
- Full user management (CRUD operations)
- Review moderation and approval
- Bulk data import from Word documents
- System-wide scheduling oversight
- Email notification management

---

## 🛠️ Tech Stack

### Backend
- **Framework:** ASP.NET Core 7.0 (C#)
- **Database:** SQL Server (Azure SQL)
- **ORM:** Entity Framework Core
- **Authentication:** JWT Bearer Tokens
- **Email:** SMTP Integration
- **Hosting:** Azure App Service

### Frontend
- **Framework:** React 19.1 with Vite
- **UI:** Tailwind CSS 4.1
- **Routing:** React Router 7.9
- **Animation:** Framer Motion
- **3D Graphics:** Three.js with React Three Fiber
- **HTTP Client:** Fetch API
- **Hosting:** Azure Static Web Apps

### DevOps & Tools
- **Version Control:** Git & GitHub
- **CI/CD:** Azure DevOps
- **Package Management:** npm, NuGet

---

## 🚀 Installation

### Prerequisites

- [.NET SDK 7.0+](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) and npm
- [SQL Server](https://www.microsoft.com/sql-server) or Azure SQL Database
- SMTP server credentials (Gmail, SendGrid, etc.)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/KIBO-Heavenly/athenor-project.git
   cd athenor-project/athenor-back-end/athenor-back-end
   ```

2. **Configure database connection**
   
   Create `appsettings.json` from the example:
   ```bash
   cp appsettings.example.json appsettings.json
   ```
   
   Edit `appsettings.json` and add your connection string:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=YOUR_SERVER;Database=athenor_db;User Id=YOUR_USER;Password=YOUR_PASSWORD;"
     }
   }
   ```

3. **Configure email settings**
   
   Create `email-settings.json`:
   ```bash
   cp email-settings.example.json email-settings.json
   ```
   
   Add your SMTP credentials (see example file for structure)

4. **Run database migrations**
   ```bash
   dotnet ef database update
   ```

5. **Start the backend server**
   ```bash
   dotnet run
   ```
   
   Backend will run on `https://localhost:7XXX` (port shown in console)

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../../athenor-front-end
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   
   Create `.env` file:
   ```bash
   echo "VITE_API_URL=https://localhost:7XXX" > .env
   ```
   
   Replace `7XXX` with your backend port

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:5173`

---

## 📖 Usage

### Default Admin Account

After running migrations, create an admin account using the registration endpoint with role `Admin`.

### API Endpoints

#### Authentication
- `POST /api/Auth/register` - Register new user
- `POST /api/Auth/login` - User login
- `POST /api/Auth/forgot-password` - Request password reset
- `POST /api/Auth/reset-password` - Reset password with token
- `GET /api/Auth/verify-email` - Verify email address

#### Schedule Management
- `GET /api/Schedule` - Get all schedules
- `POST /api/Schedule` - Create schedule (Tutor/Admin)
- `PUT /api/Schedule/{id}` - Update schedule
- `DELETE /api/Schedule/{id}` - Delete schedule

#### User Management (Admin only)
- `GET /api/Users` - Get all users
- `GET /api/Users/{id}` - Get user by ID
- `PUT /api/Users/{id}` - Update user
- `DELETE /api/Users/{id}` - Delete user

#### Reviews
- `GET /api/Reviews` - Get all reviews
- `POST /api/Reviews` - Submit review
- `PUT /api/Reviews/{id}` - Update review status (Admin)

For complete API documentation, see [API.md](docs/API.md)

---

## 🏗️ Project Structure

```
athenor-project/
├── athenor-back-end/          # .NET Backend
│   ├── Controllers/           # API endpoints
│   ├── Models/                # Database entities
│   ├── Data/                  # DbContext
│   ├── Services/              # Business logic
│   ├── DTOs/                  # Data transfer objects
│   ├── Helpers/               # Utility functions
│   └── Migrations/            # EF Core migrations
│
├── athenor-front-end/         # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── assets/            # Images, fonts
│   │   ├── AdminDashboard.jsx # Admin panel
│   │   ├── TutorSchedule.jsx  # Tutor interface
│   │   └── App.jsx            # Main app component
│   └── public/                # Static assets
│
└── docs/                      # Documentation (coming soon)
```

---

## 🧪 Testing

### Backend Tests
```bash
cd athenor-back-end
dotnet test
```

### Frontend Tests
```bash
cd athenor-front-end
npm run test
```

---

## 🚢 Deployment

### Backend (Azure App Service)
1. Create Azure SQL Database
2. Create App Service (Windows, .NET 7)
3. Configure connection strings in App Service settings
4. Deploy via Azure DevOps or GitHub Actions

### Frontend (Azure Static Web Apps)
1. Build production bundle: `npm run build`
2. Deploy `dist/` folder to Azure Static Web Apps
3. Configure custom domain (optional)

---

## 📌 About This Project

This is a **senior capstone project** developed by students and currently deployed at Texas A&M University - Corpus Christi for their tutoring services. The application is owned and maintained by the development team.

The repository is public as a portfolio piece to demonstrate full-stack development skills. While the code is open source under MIT License, this is an active production system and not accepting public contributions.

**Usage Rights:** TAMUCC has permission to use this system for their tutoring services. Others interested in similar functionality are welcome to reference the architecture and implementation patterns under the terms of the MIT License.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **KIBO-Heavenly** - *Full Stack Development* - [GitHub](https://github.com/KIBO-Heavenly)

---

## 🙏 Acknowledgments

- Texas A&M University - Corpus Christi Department of Computer Science
- TAMUCC Tutoring Services (deployment partner)
- Senior Capstone Project Team - Fall 2024/Spring 2025

**Note:** This project is independently owned by the development team. TAMUCC is a deployment partner with permission to use the system.

---

## 📞 Contact

For questions or support, please reach out:

- **Project Link:** [https://github.com/KIBO-Heavenly/athenor-project](https://github.com/KIBO-Heavenly/athenor-project)
- **Live Demo:** [Athenor on Azure](https://kind-smoke-0cd0b391e.3.azurestaticapps.net)

---

<div align="center">

**Built with ❤️ for TAMUCC**

</div>
