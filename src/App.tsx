import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard/Dashboard';
import PkapAnalyzerShell from './components/PkapAnalyzer/PkapAnalyzerShell';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FilesPage from './pages/FilesPage';
import UploadPage from './pages/UploadPage';
import BlockchainPage from './pages/BlockchainPage';
import SecurityPage from './pages/SecurityPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ActivityPage from './pages/ActivityPage';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import ReportsPage from './pages/ReportsPage';

function PublicLanding() {
  return <div className="min-h-screen w-full relative bg-[#0a0b0d] bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:100px_100px] bg-[position:center_top] flex flex-col text-white overflow-x-hidden font-mono">
    <Navbar activeNav="ABOUT" setActiveNav={() => undefined} onOpenDashboard={() => { window.location.href = '/dashboard'; }} onOpenPkap={() => { window.location.href = '/pkap'; }} />
    <LandingPage onOpenDashboard={() => { window.location.href = '/dashboard'; }} onOpenPkap={() => { window.location.href = '/pkap'; }} />
  </div>;
}

function ProtectedShell() {
  const authenticated = Boolean(window.localStorage.getItem('shaktii_token') || window.localStorage.getItem('shaktii_refresh_token'));
  return authenticated ? <AppShell /> : <Navigate to="/login" replace />;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<PublicLanding />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ProtectedShell />}>
      <Route path="/dashboard" element={<DashboardOverviewPage />} />
      <Route path="/network-console" element={<Dashboard onBack={() => { window.location.href = '/dashboard'; }} />} />
      <Route path="/files" element={<FilesPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/blockchain" element={<BlockchainPage />} />
      <Route path="/pkap" element={<PkapAnalyzerShell onBack={() => { window.location.href = '/dashboard'; }} onOpenDashboard={() => { window.location.href = '/dashboard'; }} />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/activity" element={<ActivityPage />} />
      <Route path="/reports" element={<ReportsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
