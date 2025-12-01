import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import AdminDashboard from "./AdminDashboard";
import TutorDashboard from "./TutorDashboard";
import TutorSchedule from "./TutorSchedule";
import ImportedData from "./ImportedData";
import Settings from "./Settings";
import { DarkModeProvider } from "./DarkModeContext";

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/tutor-dashboard" element={<TutorDashboard />} />
          <Route path="/tutor-schedule" element={<TutorSchedule />} />
          <Route path="/imported-data" element={<ImportedData />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;
