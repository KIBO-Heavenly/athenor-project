import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "./DarkModeContext";

import Login from "./Login";
import Register from "./Register";
import AdminDashboard from "./AdminDashboard";
import TutorDashboard from "./TutorDashboard";

import Users from "./Users";
import TutorSchedule from "./TutorSchedule";
import ImportedData from "./ImportedData";
import Settings from "./Settings";

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboards */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} /> 
          <Route path="/tutor-dashboard" element={<TutorDashboard />} />

          {/* Admin Tools */}
          <Route path="/users" element={<Users />} />
          <Route path="/imported-data" element={<ImportedData />} />
          <Route path="/settings" element={<Settings />} />

          {/* Tutor Tools */}
          <Route path="/tutor-schedule" element={<TutorSchedule />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;