import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Blocks, FileSearch, Files, LayoutDashboard, LogOut, ShieldCheck, UploadCloud } from 'lucide-react';
import { nodeApi } from '../services/nodeApi';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/files', label: 'Secure Files', icon: Files },
  { to: '/upload', label: 'Upload & Secure', icon: UploadCloud },
  { to: '/blockchain', label: 'Blockchain', icon: Blocks },
  { to: '/pkap', label: 'PKAP Analyzer', icon: FileSearch },
  { to: '/security', label: 'Security', icon: ShieldCheck },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/activity', label: 'Activity', icon: Activity },
];

export default function AppShell() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#090b0f] text-white flex">
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/10 bg-[#0f1218] p-4 flex-col">
        <div className="px-3 py-4 mb-4">
          <div className="text-xs uppercase tracking-[0.24em] text-emerald-400">SHAKTII</div>
          <div className="mt-1 text-sm text-white/60">Security Operations</div>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => { nodeApi.logout(); navigate('/login'); }}
          className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} /> Logout
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="h-16 border-b border-white/10 bg-[#0d1015]/90 backdrop-blur flex items-center justify-between px-4 md:px-6">
          <div>
            <div className="text-sm font-semibold tracking-wide">SHAKTII Control Center</div>
            <div className="text-xs text-white/40">Node.js full-stack workspace</div>
          </div>
          <NavLink to="/" className="text-xs text-white/60 hover:text-white">Public site</NavLink>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
