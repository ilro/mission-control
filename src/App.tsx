import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import TaskBoard from "./pages/TaskBoard";
import Calendar from "./pages/Calendar";
import Projects from "./pages/Projects";
import Memories from "./pages/Memories";
import Docs from "./pages/Docs";
import Team from "./pages/Team";
import Office from "./pages/Office";
import Github from "./pages/Github";
import Executives from "./pages/Executives";
import VentureStudio from "./pages/VentureStudio";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/tasks" replace />} />
          <Route path="tasks" element={<TaskBoard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="projects" element={<Projects />} />
          <Route path="memories" element={<Memories />} />
          <Route path="docs" element={<Docs />} />
          <Route path="team" element={<Team />} />
          <Route path="office" element={<Office />} />
          <Route path="github" element={<Github />} />
          <Route path="executives" element={<Executives />} />
          <Route path="venture-studio" element={<VentureStudio />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
