import { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard/Dashboard';
import PkapAnalyzerShell from './components/PkapAnalyzer/PkapAnalyzerShell';
import ResponseAppShell from './components/ResponseApp/ResponseAppShell';

type AppView = 'landing' | 'dashboard' | 'pkap' | 'response';

function getInitialView(): AppView {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view === 'dashboard' || view === 'pkap' || view === 'response') return view;
  return 'landing';
}

export default function App() {
  const [activeNav,setActiveNav]=useState('ABOUT');
  const [view,setView]=useState<AppView>(getInitialView);
  if(view==='dashboard') return <Dashboard onBack={()=>setView('landing')}/>;
  if(view==='pkap') return <PkapAnalyzerShell onBack={()=>setView('landing')} onOpenDashboard={()=>setView('dashboard')}/>;
  if(view==='response') return <ResponseAppShell onBack={()=>setView('landing')}/>;
  return <div className="min-h-screen w-full relative bg-[#0a0b0d] bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:100px_100px] bg-[position:center_top] flex flex-col text-white overflow-x-hidden font-mono">
    <Navbar activeNav={activeNav} setActiveNav={setActiveNav} onOpenDashboard={()=>setView('dashboard')} onOpenPkap={()=>setView('pkap')} onOpenResponse={()=>setView('response')}/>
    <LandingPage onOpenDashboard={()=>setView('dashboard')} onOpenPkap={()=>setView('pkap')}/>
  </div>
}