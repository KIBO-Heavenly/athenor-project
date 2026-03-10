# 🎓 Athenor Tutoring Management System - Complete Walkthrough

**Generated:** January 22, 2026  
**Purpose:** Comprehensive guide to the Athenor codebase from login to every feature

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Getting Started - The Login Flow](#getting-started---the-login-flow)
4. [Registration & Email Verification](#registration--email-verification)
5. [Frontend Components Deep Dive](#frontend-components-deep-dive)
6. [Backend API Controllers](#backend-api-controllers)
7. [Data Models & Database](#data-models--database)
8. [Azure Deployment](#azure-deployment)
9. [Feature Walkthrough](#feature-walkthrough)
10. [Configuration Files](#configuration-files)
11. [How to Test Locally](#how-to-test-locally)

---

## 🌟 Project Overview

**Athenor** is a full-stack tutoring management system designed for **Texas A&M University - Corpus Christi (TAMUCC)**. It enables administrators to:

- Manage tutoring schedules across three learning centers
- Track tutor availability
- Import schedules from Excel/Word documents
- Allow students to leave anonymous feedback for tutors

### Three Learning Centers

1. **Math Learning Center** - Mathematics tutoring
2. **Tutoring Commons** - General subject tutoring
3. **Writing Center** - Writing assistance

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│              React + Vite (Azure Static Web Apps)               │
│         https://kind-smoke-0cd0b391e.3.azurestaticapps.net      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ REST API (HTTPS)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                 │
│            ASP.NET Core 8 (Azure App Service)                   │
│  https://athenor-backend-c5gkhub7dwdyf8ft.centralus-01...       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Entity Framework Core
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│           Azure SQL Database (athenor-db-central)               │
│              athenor-sql-server-central.database...             │
└─────────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Location |
|-------|------------|----------|
| **Frontend** | React 18 + Vite | `athenor-front-end/` |
| **Backend** | ASP.NET Core 8 | `athenor-back-end/athenor-back-end/` |
| **Database** | Azure SQL Server | Cloud (Azure) |
| **Email** | Gmail SMTP | `athenor.service.noreply@gmail.com` |

---

## 🔐 Getting Started - The Login Flow

### Step 1: User Opens the Application

**File:** [athenor-front-end/src/App.jsx](athenor-front-end/src/App.jsx)

```
User visits → https://kind-smoke-0cd0b391e.3.azurestaticapps.net
              ↓
         App.jsx loads
              ↓
    React Router checks path "/"
              ↓
       Renders <Login />
```

The `App.jsx` file is the main entry point and sets up all routes:

```jsx
// Key routes defined in App.jsx
<Route path="/" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/admin-dashboard" element={<AdminDashboard />} />
<Route path="/tutor-dashboard" element={<TutorSchedule />} />
// ... and 14 more routes
```

### Step 2: Login Page Renders

**File:** [athenor-front-end/src/Login.jsx](athenor-front-end/src/Login.jsx)

The login page shows:
- Particle background animation (if effects enabled)
- Email input field
- Password input field
- Login button
- Links to Register and Forgot Password

### Step 3: User Enters Credentials and Clicks Login

```
User clicks "Login"
       ↓
Frontend sends POST request to:
  /api/Auth/login
       ↓
Backend AuthController.Login() handles it
```

**Backend File:** [athenor-back-end/athenor-back-end/Controllers/AuthController.cs](athenor-back-end/athenor-back-end/Controllers/AuthController.cs)

The login method:
1. Checks if user exists in database
2. Verifies password hash matches
3. Checks if email is verified
4. Returns user data on success

### Step 4: Successful Login

```
Backend returns:
{
  "message": "Login successful",
  "id": 123,
  "email": "user@tamucc.edu",
  "fullName": "John Doe",
  "role": "Tutor",  // or "Admin"
  "profilePicture": "...",
  "optOutReviews": false
}
       ↓
Frontend stores in sessionStorage
       ↓
Redirects based on role:
  - Admin → /admin-dashboard
  - Tutor → /tutor-dashboard
```

### Step 5: Dashboard Loads

**Admin Dashboard:** [athenor-front-end/src/AdminDashboard.jsx](athenor-front-end/src/AdminDashboard.jsx)

Admins see quick action buttons for all features.

**Tutor Dashboard:** [athenor-front-end/src/TutorSchedule.jsx](athenor-front-end/src/TutorSchedule.jsx)

Tutors see their weekly schedule across all three centers.

---

## 📝 Registration & Email Verification

### Registration Flow

**Files:**
- Frontend: [athenor-front-end/src/Register.jsx](athenor-front-end/src/Register.jsx)
- Backend: [athenor-back-end/athenor-back-end/Controllers/AuthController.cs](athenor-back-end/athenor-back-end/Controllers/AuthController.cs)

```
1. User enters Full Name, Email, Password
       ↓
2. Frontend validates (university email required)
       ↓
3. POST /api/Auth/register
       ↓
4. Backend creates user with:
   - Role = "Tutor" (forced)
   - IsEmailVerified = false
   - EmailVerificationToken = GUID
   - EmailVerificationExpiry = 24 hours
       ↓
5. Backend sends verification email (fire-and-forget)
       ↓
6. User sees success modal: "Please check your email"
```

### Email Requirements

Only these email domains are allowed:
- `@tamucc.edu`
- `@islander.tamucc.edu`

### Email Verification Flow

**Files:**
- Frontend: [athenor-front-end/src/VerifyEmail.jsx](athenor-front-end/src/VerifyEmail.jsx)
- Backend: [athenor-back-end/athenor-back-end/Controllers/AuthController.cs](athenor-back-end/athenor-back-end/Controllers/AuthController.cs)
- Email Service: [athenor-back-end/athenor-back-end/Services/EmailService.cs](athenor-back-end/athenor-back-end/Services/EmailService.cs)

```
1. User receives email with link:
   https://kind-smoke.../verify-email?token=abc123
       ↓
2. User clicks link → VerifyEmail.jsx loads
       ↓
3. User clicks "Verify My Email" button
       ↓
4. POST /api/Auth/verify-email?token=abc123
       ↓
5. Backend sets IsEmailVerified = true
       ↓
6. User can now log in!
```

### Password Reset Flow

**Files:**
- [athenor-front-end/src/ForgotPassword.jsx](athenor-front-end/src/ForgotPassword.jsx)
- [athenor-front-end/src/ResetPassword.jsx](athenor-front-end/src/ResetPassword.jsx)

```
1. User clicks "Forgot Password" on login page
       ↓
2. Enters email → POST /api/Auth/forgot-password
       ↓
3. Backend sends reset email (1-hour expiry)
       ↓
4. User clicks link → ResetPassword.jsx
       ↓
5. Enter new password → POST /api/Auth/reset-password
       ↓
6. Password updated, user logs in
```

---

## 🖥️ Frontend Components Deep Dive

### Directory Structure

```
athenor-front-end/src/
├── main.jsx              # React entry point
├── App.jsx               # Router setup
├── App.css               # Global styles
├── index.css             # Tailwind imports
├── config.js             # API URL configuration
├── DarkModeContext.jsx   # Theme state management
├── colorPalette.js       # Color definitions
│
├── Login.jsx             # Login page
├── Register.jsx          # Registration page
├── ForgotPassword.jsx    # Password reset request
├── ResetPassword.jsx     # New password entry
├── VerifyEmail.jsx       # Email verification
│
├── AdminDashboard.jsx    # Main admin hub
├── TutorSchedule.jsx     # Tutor's personal schedule
├── MasterSchedule.jsx    # Full schedule view
├── AssignTutors.jsx      # Schedule assignment (largest file!)
├── TutorScheduleUpload.jsx # Manual schedule entry
│
├── ManageTutors.jsx      # Edit/delete tutors
├── ManageUsers.jsx       # User administration
├── ImportedData.jsx      # View imported Excel data
├── WordDocumentUpload.jsx # Parse availability forms
│
├── Settings.jsx          # User preferences
├── SeeReviews.jsx        # Personal reviews dashboard
├── PublicReviews.jsx     # Anonymous review submission
│
├── NavBar.jsx            # Navigation header
├── Modal.jsx             # Reusable dialog
│
├── components/
│   └── ParticleBackground.jsx  # Animated background
│
└── assets/               # Images and static files
```

### Key Components Explained

#### 1. AdminDashboard.jsx (Main Hub)

This is the central control panel showing:
- **Import Data** - Upload Excel/CSV files
- **Upload Availability Form** - Parse Word documents
- **Assign Times** - Main scheduling interface
- **Master Schedule** - View all assignments
- **Manage Users** - User administration
- **My Reviews** - Personal feedback

#### 2. AssignTutors.jsx (Core Feature - 1,081 lines!)

The most complex component. It handles:
- Three-tab interface for each learning center
- 19 time slots × 5 days = 95 cells per section
- Sidebar showing available tutors with colors
- Click a cell to assign tutors (up to 4 per slot)
- Hour tracking (warns at 19 hours/week)
- Conflict detection (can't double-book across sections)
- Calendar archive for historical records

```
┌─────────────────────────────────────────────────────────────┐
│ [Math Center] [Tutoring Commons] [Writing Center]          │
├─────────────────────────────────────────────────────────────┤
│ Tutors     │ Mon    │ Tue    │ Wed    │ Thu    │ Fri      │
│ ┌────────┐ ├────────┼────────┼────────┼────────┼─────────┤│
│ │ John   │ │10:00AM │ Alice  │        │ Bob    │         ││
│ │ Jane   │ │10:30AM │        │ John   │        │ Jane    ││
│ │ Bob    │ │11:00AM │ Jane   │ Alice  │ John   │         ││
│ │ Alice  │ │ ...    │  ...   │  ...   │  ...   │  ...    ││
│ └────────┘ └────────┴────────┴────────┴────────┴─────────┘│
└─────────────────────────────────────────────────────────────┘
```

#### 3. WordDocumentUpload.jsx (653 lines)

Parses Word documents containing tutor availability forms:
- Uses `mammoth.js` to extract HTML from .docx
- Finds tables with tutor names and time availability
- Looks for "x" marks indicating available slots
- Review mode to edit before saving
- Detects duplicates against existing tutors

#### 4. PublicReviews.jsx (No Login Required!)

Special page where anyone can leave anonymous feedback:
- Shows grid of tutors with profile pictures
- Click tutor to open review form
- 5-star rating (required)
- Optional comment
- Completely anonymous submissions

**URL:** `https://kind-smoke.../public-reviews`

#### 5. DarkModeContext.jsx (Theme Management)

Provides global theme state:

```jsx
const { isDarkMode, setIsDarkMode, disableEffects, setDisableEffects } = useDarkMode();
```

Persists preferences in localStorage.

---

## 🔧 Backend API Controllers

### Directory Structure

```
athenor-back-end/athenor-back-end/
├── Program.cs                    # Entry point & configuration
├── appsettings.json             # Configuration values
├── appsettings.Development.json # Dev overrides
│
├── Controllers/
│   ├── AuthController.cs        # Login, Register, Verify, Reset
│   ├── UsersController.cs       # User management
│   ├── ScheduleController.cs    # Schedule CRUD
│   ├── ReviewsController.cs     # Review system
│   ├── TutorAvailabilityController.cs  # Availability data
│   ├── DataImportController.cs  # Excel/CSV parsing
│   └── PingController.cs        # Health check
│
├── Data/
│   └── ApplicationDbContext.cs  # Database context
│
├── Models/
│   ├── User.cs
│   ├── Schedule.cs
│   ├── Review.cs
│   └── TutorAvailability.cs
│
├── DTOs/                        # Data Transfer Objects
│   ├── LoginDto.cs
│   ├── RegisterDto.cs
│   ├── PasswordResetDto.cs
│   ├── ScheduleDto.cs
│   └── ResendVerificationDto.cs
│
├── Services/
│   └── EmailService.cs          # SMTP email sending
│
├── Helpers/
│   └── PasswordHelper.cs        # SHA-256 password hashing
│
└── Migrations/                  # EF Core migrations
```

### API Endpoints Reference

#### Authentication (`/api/Auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/Auth/register` | Create new user (Tutor role) |
| POST | `/api/Auth/login` | Authenticate user |
| POST | `/api/Auth/verify-email?token=...` | Verify email address |
| POST | `/api/Auth/resend-verification` | Resend verification email |
| POST | `/api/Auth/forgot-password` | Request password reset |
| POST | `/api/Auth/reset-password` | Set new password |

#### Users (`/api/Users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Users` | List all users (excludes admin) |
| GET | `/api/Users/stats` | Get user statistics |
| DELETE | `/api/Users/{id}` | Delete user + cascade data |
| PUT | `/api/Users/{id}/profile-picture` | Update profile picture |
| PUT | `/api/Users/{id}/opt-out` | Toggle review visibility |

#### Schedule (`/api/Schedule`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Schedule` | Get all schedules |
| GET | `/api/Schedule/user/{userId}` | Get tutor's schedules |
| POST | `/api/Schedule` | Add schedule entry |
| DELETE | `/api/Schedule/{id}` | Delete single entry |
| DELETE | `/api/Schedule/tutor/{userId}` | Delete all for tutor |
| DELETE | `/api/Schedule/by-name/{name}` | Delete by tutor name |
| DELETE | `/api/Schedule/all` | Clear entire schedule |

#### Reviews (`/api/Reviews`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Reviews/tutors` | List reviewable tutors |
| GET | `/api/Reviews/users-with-reviews` | All users with stats (admin) |
| GET | `/api/Reviews/tutor/{tutorId}` | Tutor's reviews + average |
| POST | `/api/Reviews` | Submit new review |
| DELETE | `/api/Reviews/{id}` | Delete review |

#### Tutor Availability (`/api/TutorAvailability`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/TutorAvailability` | Get all availabilities |
| GET | `/api/TutorAvailability/{id}` | Get by ID |
| GET | `/api/TutorAvailability/by-name/{name}` | Get by name |
| POST | `/api/TutorAvailability` | Create single |
| POST | `/api/TutorAvailability/batch` | Batch create/update |
| PUT | `/api/TutorAvailability/{id}` | Update availability |
| DELETE | `/api/TutorAvailability/{id}` | Delete by ID |
| DELETE | `/api/TutorAvailability/by-name/{name}` | Delete by name |

#### Data Import (`/api/DataImport`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/DataImport/upload` | Upload & parse Excel/CSV |

---

## 💾 Data Models & Database

### User Model

```csharp
public class User
{
    public int Id { get; set; }                    // Primary key
    public string Email { get; set; }              // Unique, required
    public string PasswordHash { get; set; }       // SHA-256 hash
    public string Role { get; set; }               // "Admin" or "Tutor"
    public string? FullName { get; set; }          // Display name
    public bool IsEmailVerified { get; set; }      // Must verify to login
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationExpiry { get; set; }
    public string? ProfilePicture { get; set; }    // Base64 or preset name
    public bool OptOutReviews { get; set; }        // Hide from reviews
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpiry { get; set; }
    public ICollection<Review> Reviews { get; set; }  // Navigation property
}
```

### Schedule Model

```csharp
public class Schedule
{
    public int Id { get; set; }
    public int? UserId { get; set; }               // FK to User (optional)
    public string TutorName { get; set; }          // Required
    public string DayOfWeek { get; set; }          // "Monday" - "Friday"
    public string TimeSlot { get; set; }           // "10:00 – 10:30 AM" etc.
    public string? Section { get; set; }           // Center name
    public DateTime CreatedAt { get; set; }
}
```

### Review Model

```csharp
public class Review
{
    public int Id { get; set; }
    public int TutorId { get; set; }               // FK to User
    public User Tutor { get; set; }                // Navigation
    public int Rating { get; set; }                // 1-5 stars
    public string? Comment { get; set; }           // Max 1000 chars
    public string? ReviewerName { get; set; }      // "Anonymous" if empty
    public DateTime CreatedAt { get; set; }
}
```

### TutorAvailability Model

```csharp
public class TutorAvailability
{
    public int Id { get; set; }
    public string TutorName { get; set; }          // Required
    public string AvailabilityJson { get; set; }   // JSON format
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### Database Schema Diagram

```
┌──────────────┐     ┌──────────────┐
│    Users     │     │   Reviews    │
├──────────────┤     ├──────────────┤
│ Id (PK)      │◄────│ TutorId (FK) │
│ Email        │     │ Id (PK)      │
│ PasswordHash │     │ Rating       │
│ Role         │     │ Comment      │
│ FullName     │     │ ReviewerName │
│ IsEmailVeri..│     │ CreatedAt    │
│ ...          │     └──────────────┘
└──────────────┘

┌──────────────────┐     ┌────────────────────┐
│    Schedules     │     │ TutorAvailabilities│
├──────────────────┤     ├────────────────────┤
│ Id (PK)          │     │ Id (PK)            │
│ UserId (FK?)     │     │ TutorName          │
│ TutorName        │     │ AvailabilityJson   │
│ DayOfWeek        │     │ CreatedAt          │
│ TimeSlot         │     │ UpdatedAt          │
│ Section          │     └────────────────────┘
│ CreatedAt        │
└──────────────────┘
```

---

## ☁️ Azure Deployment

### Current Azure Resources

| Resource | Type | URL/Name |
|----------|------|----------|
| Frontend | Static Web App | `kind-smoke-0cd0b391e.3.azurestaticapps.net` |
| Backend | App Service | `athenor-backend-c5gkhub7dwdyf8ft.centralus-01.azurewebsites.net` |
| Database | Azure SQL | `athenor-sql-server-central.database.windows.net` |
| DB Name | SQL Database | `athenor-db-central` |

### How Deployment Works

#### Frontend (Static Web App)
- Connected to GitHub repository
- Auto-deploys on push to main branch
- Configuration in `staticwebapp.config.json`

#### Backend (App Service)
- Can be deployed via:
  - Visual Studio Publish
  - GitHub Actions
  - Azure CLI
- App settings stored in Azure Portal (not in code)

### Azure Portal Navigation

1. Go to [portal.azure.com](https://portal.azure.com)
2. Search for "athenor" in the top search bar
3. You'll see:
   - **athenor-backend...** (App Service)
   - **athenor-sql-server-central** (SQL Server)
   - **kind-smoke...** (Static Web App)

### Viewing Backend Logs

1. Open the App Service in Azure Portal
2. Go to "Log stream" (under Monitoring)
3. See real-time console output

### Viewing Database

1. Open Azure SQL Database
2. Use "Query editor" in the portal
3. Or connect via SQL Server Management Studio:
   - Server: `athenor-sql-server-central.database.windows.net`
   - Database: `athenor-db-central`
   - User: `sqladmin`

---

## 🎯 Feature Walkthrough

### Feature 1: Import Data (Excel/CSV Upload)

**How to use:**
1. Login as Admin
2. Click "Import Data" on dashboard
3. Select an Excel or CSV file
4. Enter a title for the dataset
5. View the imported data in a sortable/filterable table

**Behind the scenes:**
- Frontend: `AdminDashboard.jsx` → file upload
- Backend: `DataImportController.cs` → parses with EPPlus
- Display: `ImportedData.jsx` → renders table

### Feature 2: Upload Availability Form (Word Documents)

**How to use:**
1. Click "Upload Availability Form"
2. Drag or select a .docx file
3. System extracts tutor names and time availability
4. Review parsed data
5. Click Save to store in database

**Behind the scenes:**
- Frontend: `WordDocumentUpload.jsx` → uses mammoth.js
- Backend: `TutorAvailabilityController.cs` → batch save

### Feature 3: Assign Times (Main Scheduling)

**How to use:**
1. Click "Assign Times"
2. Select a center tab (Math/Tutoring/Writing)
3. Click on a time slot cell
4. Select tutor(s) from dropdown (up to 4)
5. Colors auto-assigned from tutor sidebar
6. Watch for hour warnings (> 19 hours)

**Behind the scenes:**
- Frontend: `AssignTutors.jsx` → complex state management
- Data stored in: localStorage + backend sync

### Feature 4: Master Schedule View

**How to use:**
1. Click "Master Schedule"
2. Switch between center tabs
3. See all assignments color-coded
4. Click refresh for latest data

### Feature 5: Manage Tutors

**How to use:**
1. Click "Manage Tutors"
2. Search for tutors by name
3. Edit names, assign custom colors
4. Delete tutors (removes from all schedules)

### Feature 6: Manage Users

**How to use:**
1. Click "Manage Users"
2. View all registered users
3. See verification status
4. Delete users (type "delete" to confirm)

### Feature 7: Settings

**How to use:**
1. Click Settings (gear icon)
2. Change profile picture (upload or preset)
3. Toggle dark mode
4. Toggle effects (for performance)
5. Opt out of reviews

### Feature 8: Reviews

**For Students (Public):**
1. Visit `/public-reviews` (no login needed)
2. Click on a tutor
3. Leave 1-5 star rating
4. Optionally add comment
5. Submit anonymously

**For Tutors:**
1. Login and go to "My Reviews"
2. See your average rating
3. Read anonymous feedback

---

## ⚙️ Configuration Files

### Frontend Config

**File:** [athenor-front-end/src/config.js](athenor-front-end/src/config.js)

```javascript
export const API_URL = import.meta.env.VITE_API_URL || 
  'https://athenor-backend-c5gkhub7dwdyf8ft.centralus-01.azurewebsites.net';
```

**File:** [athenor-front-end/staticwebapp.config.json](athenor-front-end/staticwebapp.config.json)

Handles SPA routing - all routes redirect to index.html.

### Backend Config

**File:** [athenor-back-end/athenor-back-end/appsettings.json](athenor-back-end/athenor-back-end/appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:athenor-sql-server-central..."
  },
  "FrontendUrl": "https://kind-smoke-0cd0b391e.3.azurestaticapps.net",
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUser": "...",
    "SmtpPass": "...",
    "FromEmail": "...",
    "FromName": "Athenor"
  }
}
```

---

## 🧪 How to Test Locally

### Frontend

```bash
cd athenor-front-end
npm install
npm run dev
```

Opens at `http://localhost:5173`

### Backend

```bash
cd athenor-back-end/athenor-back-end
dotnet run
```

Opens at `http://localhost:5000` (or 5001 for HTTPS)

### Connect Frontend to Local Backend

Create `.env` file in `athenor-front-end`:

```
VITE_API_URL=http://localhost:5000
```

### Demo Admin Login

- **Email:** `***REMOVED***`
- **Password:** `***REMOVED***`

This account is auto-created and always works.

---

## 📊 Business Rules Summary

| Rule | Description |
|------|-------------|
| **Email Domains** | Only `@tamucc.edu` and `@islander.tamucc.edu` allowed |
| **Default Role** | All new registrations get "Tutor" role |
| **Email Verification** | Required before login; 24-hour expiry |
| **Password Reset** | 1-hour expiry |
| **Admin Protection** | `***REMOVED***` cannot be deleted |
| **Max Per Slot** | Up to 4 tutors per time slot |
| **Hour Limit** | Warning at 19 hours/week per tutor |
| **Reviews** | Anonymous; tutors can opt-out |
| **Time Slots** | 30-minute increments, 10:00 AM - 7:30 PM |
| **Days** | Monday through Friday only |

---

## 🛠️ Tech Stack Summary

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool (faster than CRA)
- **React Router v6** - Client-side routing
- **Framer Motion** - Animations
- **Tailwind CSS** - Utility-first styling
- **Mammoth.js** - Word document parsing

### Backend
- **ASP.NET Core 8** - Web API framework
- **Entity Framework Core** - ORM
- **EPPlus** - Excel file parsing
- **System.Net.Mail** - SMTP email

### Infrastructure
- **Azure Static Web Apps** - Frontend hosting
- **Azure App Service** - Backend hosting
- **Azure SQL Database** - Data storage
- **Gmail SMTP** - Email delivery

---

## 📞 Contact & Support

This documentation was generated to help you understand the Athenor codebase. If you have questions:

1. Check the console logs in browser DevTools
2. Check Azure Log Stream for backend issues
3. Review the relevant controller/component files
4. Look at the network tab to see API requests/responses

---

*Document generated by GitHub Copilot on January 22, 2026*
