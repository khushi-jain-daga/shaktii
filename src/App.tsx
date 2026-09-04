import { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard/Dashboard';
import PkapAnalyzerShell from './components/PkapAnalyzer/PkapAnalyzerShell';

export default function App() {
  const [activeNav,setActiveNav]=useState('ABOUT');
  const [view,setView]=useState<'landing'|'dashboard'|'pkap'>('landing');
  if(view==='dashboard') return <Dashboard onBack={()=>setView('landing')} onOpenPkap={()=>setView('pkap')}/>;
  if(view==='pkap') return <PkapAnalyzerShell onBack={()=>setView('landing')} onOpenDashboard={()=>setView('dashboard')}/>;
  return <div className="min-h-screen w-full relative bg-[#0a0b0d] bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:100px_100px] bg-[position:center_top] flex flex-col text-white overflow-x-hidden font-mono">
    <Navbar activeNav={activeNav} setActiveNav={setActiveNav} onOpenDashboard={()=>setView('dashboard')} onOpenPkap={()=>setView('pkap')}/>
    <LandingPage onOpenDashboard={()=>setView('dashboard')} onOpenPkap={()=>setView('pkap')}/>
  </div>
}
