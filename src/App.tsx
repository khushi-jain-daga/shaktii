import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard/Dashboard';
import PkapAnalyzerShell from './components/PkapAnalyzer/PkapAnalyzerShell';
import AppShell from './components/AppShell';
import ComingSoonPage from './pages/ComingSoonPage';
import LoginPage from './pages/LoginPage';
import FilesPage from './pages/FilesPage';
import UploadPage from './pages/UploadPage';

function PublicLanding() {
  return (
    <div className="min-h-screen w-full relative bg-[#0a0b0d] bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:100px_100px] bg-[position:center_top] flex flex-col text-white overflow-x-hidden font-mono">
      <Navbar
        activeNav="ABOUT"
        setActiveNav={() => undefined}
        onOpenDashboard={() => { window.location.href = '/dashboard'; }}
        onOpenPkap={() => { window.location.href = '/pkap'; }}
      />
      <LandingPage
        onOpenDashboard={() => { window.location.href = '/dashboard'; }}
        onOpenPkap={() => { window.location.href = '/pkap'; }}
      />
    </div>
  );
}

function ProtectedShell() {
  const authenticated = Boolean(window.localStorage.getItem('shaktii_token'));
  return authenticated ? <AppShell /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedShell />}>
          <Route path="/dashboard" element={<Dashboard onBack={() => { window.location.href = '/'; }} />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route
            path="/pkap"
            element={
              <PkapAnalyzerShell
                onBack={() => { window.location.href = '/'; }}
                onOpenDashboard={() => { window.location.href = '/dashboard'; }}
              />
            }
          />
          <Route
            path="/security"
            element={<ComingSoonPage title="Security Monitoring" description="Threat events, alerts, severity analysis and investigation workflows." />}
          />
          <Route
            path="/analytics"
            element={<ComingSoonPage title="Analytics" description="Dedicated operational, security and verification analytics powered by Node.js API endpoints." />}
          />
          <Route
            path="/activity"
            element={<ComingSoonPage title="Activity & Audit Logs" description="Searchable audit history for security actions, investigations, reports and operator activity." />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
