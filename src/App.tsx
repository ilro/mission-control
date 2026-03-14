import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
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
import ExecutiveDetail from "./pages/ExecutiveDetail";
import VentureStudio from "./pages/VentureStudio";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(224 71% 8%)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "hsl(213 31% 91%)",
            },
          }}
        />
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
            <Route path="executives/:id" element={<ExecutiveDetail />} />
            <Route path="venture-studio" element={<VentureStudio />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
