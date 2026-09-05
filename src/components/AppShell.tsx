import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Blocks, FileSearch, Files, FileText, LayoutDashboard, LogOut, Menu, ShieldCheck, UploadCloud, X } from 'lucide-react';
import { nodeApi } from '../services/nodeApi';
import BrandLogo from './common/BrandLogo';
import PwaInstallButton from './PwaInstallButton';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/files', label: 'Secure Files', icon: Files },
  { to: '/upload', label: 'Upload & Secure', icon: UploadCloud },
  { to: '/blockchain', label: 'Blockchain', icon: Blocks },
  { to: '/pkap', label: 'PKAP Analyzer', icon: FileSearch },
  { to: '/security', label: 'Security', icon: ShieldCheck },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/reports', label: 'Reports', icon: FileText },
];

function Navigation({ close }: { close?: () => void }) {
  return <nav className="space-y-1 flex-1">{navItems.map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} onClick={close} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
      <Icon size={17} />{label}
    </NavLink>
  ))}</nav>;
}

export default function AppShell() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = nodeApi.currentUser();
  const logout = () => { nodeApi.logout(); navigate('/login'); };

  return <div className="min-h-screen bg-[#090b0f] text-white lg:flex">
    <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/10 bg-[#0f1218] p-4 flex-col sticky top-0 h-screen">
      <div className="px-2 py-4 mb-3"><BrandLogo heightClassName="h-9" /><div className="mt-3 text-xs text-white/40">Security Operations</div></div>
      <Navigation />
      <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
        {user && <div className="px-3 py-2"><div className="truncate text-xs text-white/70">{user.name}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-emerald-400">{user.role.replace('_', ' ')}</div></div>}
        <PwaInstallButton />
        <button onClick={logout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white"><LogOut size={17} />Logout</button>
      </div>
    </aside>

    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden">
      <button aria-label="Close navigation" className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
      <aside className="relative h-full w-[82%] max-w-xs border-r border-white/10 bg-[#0f1218] p-4 flex flex-col">
        <div className="flex items-center justify-between px-2 py-3 mb-3"><BrandLogo heightClassName="h-8" /><button onClick={() => setMobileOpen(false)} className="p-2 text-white/60"><X size={20} /></button></div>
        <Navigation close={() => setMobileOpen(false)} />
        <div className="border-t border-white/10 pt-3"><PwaInstallButton /><button onClick={logout} className="mt-2 w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60"><LogOut size={17} />Logout</button></div>
      </aside>
    </div>}

    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-[#0d1015]/95 backdrop-blur flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="lg:hidden rounded-md border border-white/10 p-2 text-white/70"><Menu size={18} /></button><div><div className="text-sm font-semibold tracking-wide">SHAKTII Control Center</div><div className="hidden sm:block text-xs text-white/40">Node.js full-stack security workspace</div></div></div>
        <NavLink to="/" className="text-xs text-white/60 hover:text-white">Public site</NavLink>
      </header>
      <main className="p-4 md:p-6 lg:p-8"><Outlet /></main>
    </div>
  </div>;
}
