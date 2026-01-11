# Athenor Frontend

Modern React-based frontend for the Athenor tutoring management system.

## 🎨 Tech Stack

- **Framework:** React 19.1
- **Build Tool:** Vite 7.1
- **Styling:** Tailwind CSS 4.1
- **Router:** React Router 7.9
- **Animation:** Framer Motion 12
- **3D Graphics:** Three.js with React Three Fiber
- **HTTP:** Fetch API

## 📁 Project Structure

```
athenor-front-end/
├── src/
│   ├── components/          # Reusable UI components
│   ├── assets/              # Images, fonts, static files
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   ├── config.js            # API configuration
│   ├── colorPalette.js      # Theme colors
│   ├── DarkModeContext.jsx  # Dark mode state management
│   │
│   ├── Login.jsx            # Login page
│   ├── Register.jsx         # Registration page
│   ├── ForgotPassword.jsx   # Password recovery
│   ├── ResetPassword.jsx    # Password reset
│   ├── VerifyEmail.jsx      # Email verification
│   │
│   ├── AdminDashboard.jsx   # Admin control panel
│   ├── ManageUsers.jsx      # User management (Admin)
│   ├── ManageTutors.jsx     # Tutor management (Admin)
│   ├── SeeReviews.jsx       # Review moderation (Admin)
│   │
│   ├── TutorSchedule.jsx    # Tutor schedule view/edit
│   ├── TutorScheduleUpload.jsx  # Schedule upload
│   ├── AssignTutors.jsx     # Tutor assignment
│   ├── MasterSchedule.jsx   # Full schedule view
│   │
│   ├── PublicReviews.jsx    # Public review display
│   ├── Settings.jsx         # User settings
│   ├── ImportedData.jsx     # Data import interface
│   ├── WordDocumentUpload.jsx  # Document upload
│   └── NavBar.jsx           # Navigation component
│
├── public/                  # Static assets
│   └── staticwebapp.config.json
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint rules
└── package.json             # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- npm (comes with Node.js)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   
   Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   App will open at `http://localhost:5173`

## 📜 Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎨 Features

### Student Portal
- Browse available tutors and schedules
- View real-time tutor availability
- Submit anonymous reviews
- Modern, responsive UI with dark mode

### Tutor Interface
- Manage personal schedule
- Upload schedule documents
- Set availability preferences
- Track student feedback

### Admin Dashboard
- User management (create, edit, delete users)
- Review moderation system
- Bulk data import from Word documents
- System-wide analytics
- Schedule oversight

## 🔐 Authentication Flow

1. User registers with email and password
2. Email verification sent
3. User logs in → receives JWT token
4. Token stored in localStorage
5. Token included in API requests via `Authorization` header

### Protected Routes

Routes are protected based on user role:
- **/admin/** - Admin only
- **/tutor/** - Tutors and Admins
- **/student/** - All authenticated users

## 🎨 Styling

### Tailwind CSS

Project uses Tailwind CSS for styling. Configuration in `tailwind.config.js`.

Custom colors defined in [colorPalette.js](src/colorPalette.js):
```javascript
const colors = {
  primary: '#1E40AF',
  secondary: '#10B981',
  // ...
};
```

### Dark Mode

Dark mode is managed via React Context in [DarkModeContext.jsx](src/DarkModeContext.jsx):
```jsx
import { useDarkMode } from './DarkModeContext';

const { darkMode, toggleDarkMode } = useDarkMode();
```

## 📡 API Integration

API calls configured in [config.js](src/config.js):

```javascript
import { API_URL } from './config';

// Example API call
const response = await fetch(`${API_URL}/api/Schedule`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🧪 Testing

```bash
# Run tests (if configured)
npm run test

# Run tests in watch mode
npm run test:watch
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

### Azure Static Web Apps

1. **Configure Azure**
   - Create Static Web App resource
   - Connect to GitHub repository
   - Set build folder to `dist`

2. **Environment Variables**
   
   Set in Azure Portal → Configuration:
   - `VITE_API_URL=https://your-backend-api.com`

3. **Deploy**
   ```bash
   npm run build
   # Deploy dist/ folder
   ```

## 🔧 Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes appear immediately without full reload.

### ESLint

Code quality enforced with ESLint:
```bash
npm run lint
```

### React DevTools

Install [React DevTools](https://react.dev/learn/react-developer-tools) browser extension for debugging.

## 📦 Key Dependencies

- **react** (19.1) - UI library
- **react-router-dom** (7.9) - Client-side routing
- **tailwindcss** (4.1) - Utility-first CSS
- **framer-motion** (12.23) - Animation library
- **three** (0.181) - 3D graphics
- **@react-three/fiber** (9.4) - React renderer for Three.js
- **mammoth** (1.6) - Word document parsing

## 🐛 Common Issues

### Port Already in Use

```bash
# Change port in vite.config.js
export default {
  server: { port: 3000 }
}
```

### CORS Errors

Ensure backend allows frontend origin in CORS policy.

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

Part of the Athenor project - see main [LICENSE](../LICENSE)
