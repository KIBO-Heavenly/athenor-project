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

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/tutor-dashboard" element={<AdminDashboard />} />
          <Route path="/tutor-schedule" element={<TutorSchedule />} />
          <Route path="/tutor-schedule-upload" element={<TutorScheduleUpload />} />
          <Route path="/word-document-upload" element={<WordDocumentUpload />} />
          <Route path="/assign-tutors" element={<AssignTutors />} />
          <Route path="/master-schedule" element={<MasterSchedule />} />
          <Route path="/manage-tutors" element={<ManageTutors />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/imported-data" element={<ImportedData />} />
          <Route path="/settings" element={<Settings />} />
          {/* Public Review Page - No login required */}
          <Route path="/reviews" element={<PublicReviews />} />
          <Route path="/reviews/:tutorId" element={<PublicReviews />} />
          {/* Admin-only Review Page */}
          <Route path="/see-reviews" element={<SeeReviews />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;
