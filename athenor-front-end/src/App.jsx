import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import VerifyEmail from "./VerifyEmail";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import AdminDashboard from "./AdminDashboard";
import TutorSchedule from "./TutorSchedule";
import TutorScheduleUpload from "./TutorScheduleUpload";
import WordDocumentUpload from "./WordDocumentUpload";
import AssignTutors from "./AssignTutors";
import MasterSchedule from "./MasterSchedule";
import ManageTutors from "./ManageTutors";
import ManageUsers from "./ManageUsers";
import ImportedData from "./ImportedData";
import Settings from "./Settings";
import PublicReviews from "./PublicReviews";
import SeeReviews from "./SeeReviews";
import { DarkModeProvider } from "./DarkModeContext";
import { ProtectedRoute, AdminRoute, GuestRoute } from "./ProtectedRoute";

function App() 
{
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - only accessible when NOT logged in */}
          <Route path="/" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes - require authentication */}
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/tutor-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/tutor-schedule" element={<ProtectedRoute><TutorSchedule /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          {/* All authenticated users can access these (Admin & Tutor have same privileges) */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/tutor-schedule-upload" element={<ProtectedRoute><TutorScheduleUpload /></ProtectedRoute>} />
          <Route path="/word-document-upload" element={<ProtectedRoute><WordDocumentUpload /></ProtectedRoute>} />
          <Route path="/assign-tutors" element={<ProtectedRoute><AssignTutors /></ProtectedRoute>} />
          <Route path="/master-schedule" element={<ProtectedRoute><MasterSchedule /></ProtectedRoute>} />
          <Route path="/manage-tutors" element={<ProtectedRoute><ManageTutors /></ProtectedRoute>} />
          <Route path="/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
          <Route path="/imported-data" element={<ProtectedRoute><ImportedData /></ProtectedRoute>} />
          <Route path="/see-reviews" element={<ProtectedRoute><SeeReviews /></ProtectedRoute>} />
          
          {/* Public Review Pages - No login required */}
          <Route path="/reviews" element={<PublicReviews />} />
          <Route path="/reviews/:tutorId" element={<PublicReviews />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;
