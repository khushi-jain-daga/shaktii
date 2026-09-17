import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, BookOpen, ChevronRight, FileSearch, Home, Lock, Radar, Settings, Shield, Smartphone, Zap } from 'lucide-react';
import Dashboard from '../components/Dashboard/Dashboard';
import PkapAnalyzerShell from '../components/PkapAnalyzer/PkapAnalyzerShell';
import DocsPage from '../components/PkapAnalyzer/DocsPage';
import SettingsPage, { defaultSettings } from '../components/PkapAnalyzer/SettingsPage';
import type { PkapSettings } from '../components/PkapAnalyzer/SettingsPage';
import { isNativeRuntime, saveTextFile, shareText } from '../native/capacitor';

type MobileView = 'home' | 'analyze' | 'dashboard' | 'docs' | 'settings';

type QuickAction = {
  id: MobileView;
  title: string;
  subtitle: string;
  icon: ReactNode;
  accent: string;
};

const quickActions: QuickAction[] = [
  {
    id: 'analyze',
    title: 'Analyze Logs',
    subtitle: 'Upload or paste .log, .txt, .json, and .csv evidence.',
    icon: <FileSearch size={22} />,
    accent: 'from-[#7c3aed]/40 to-[#06b6d4]/20',
  },
  {
    id: 'dashboard',
    title: 'Live Defense',
    subtitle: 'Open the SHAKTII cyber operations dashboard.',
    icon: <Activity size={22} />,
    accent: 'from-[#22c55e]/30 to-[#14b8a6]/20',
  },
  {
    id: 'docs',
    title: 'Workflow Docs',
    subtitle: 'Explain the PKAP pipeline during project evaluation.',
    icon: <BookOpen size={22} />,
    accent: 'from-[#f59e0b]/30 to-[#ef4444]/20',
  },
  {
    id: 'settings',
    title: 'Controls',
    subtitle: 'Manage local privacy, AI assist, and cleanup settings.',
    icon: <Settings size={22} />,
    accent: 'from-[#8b5cf6]/30 to-[#ec4899]/20',
  },
];

function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090d]/95 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/80"
            >
              Back
            </button>
          ) : null}
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#9ee7ff]">PWNSHAKTII</div>
            <h1 className="font-sans text-lg font-semibold tracking-[-0.03em] text-white">{title}</h1>
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">
          <Shield size={18} />
        </div>
      </div>
    </header>
  );
}

function BottomNav({ active, onChange }: { active: MobileView; onChange: (view: MobileView) => void }) {
  const items: Array<{ id: MobileView; label: string; icon: ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'analyze', label: 'Analyze', icon: <FileSearch size={18} /> },
    { id: 'dashboard', label: 'Live', icon: <Radar size={18} /> },
    { id: 'settings', label: 'More', icon: <Settings size={18} /> },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#07090d]/95 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item) => {
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] transition ${selected ? 'bg-cyan-400/15 text-cyan-100' : 'text-white/45'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-2 font-sans text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function HomeScreen({ onNavigate }: { onNavigate: (view: MobileView) => void }) {
  const runtime = isNativeRuntime() ? 'Android App' : 'Web Preview';

  const demoReport = useMemo(() => {
    return [
      '# SHAKTII Mobile Demo Report',
      '',
      '- Runtime: ' + runtime,
      '- Analyzer: PKAP local + serverless workflow',
      '- Status: Ready for log ingestion demo',
    ].join('\n');
  }, [runtime]);

  const handleShareDemo = async () => {
    await shareText('SHAKTII Demo Report', demoReport);
  };

  const handleSaveDemo = async () => {
    await saveTextFile('shaktii-demo-report.md', demoReport);
  };

  return (
    <main className="pb-28">
      <TopBar title="Mobile Command Center" />
      <section className="px-4 py-5">
        <div className="overflow-hidden rounded-[32px] border border-cyan-300/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_34%),linear-gradient(135deg,rgba(17,24,39,0.96),rgba(3,7,18,0.98))] p-5 shadow-2xl shadow-cyan-950/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                <Smartphone size={12} /> Native Ready
              </div>
              <h2 className="mt-4 font-sans text-3xl font-semibold leading-tight tracking-[-0.06em] text-white">
                SHAKTII cyber defense in your pocket.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/60">
                A mobile-first command layer for PKAP log analysis, threat triage, incident reports, and demo evaluation.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-3 text-cyan-100">
              <Zap size={28} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <StatusCard label="Runtime" value={runtime} />
            <StatusCard label="Mode" value="Secure" />
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onNavigate(action.id)}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-[#10131a] text-left transition hover:border-cyan-300/30"
            >
              <div className={`bg-gradient-to-br ${action.accent} p-4`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-3 text-white">{action.icon}</div>
                    <div>
                      <h3 className="font-sans text-base font-semibold text-white">{action.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-white/55">{action.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-white/40 transition group-hover:translate-x-1 group-hover:text-cyan-100" size={20} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Lock size={16} className="text-emerald-300" /> Demo tools
          </div>
          <p className="mt-2 text-xs leading-5 text-white/50">
            Use these buttons to show native sharing and document saving during evaluation.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={handleShareDemo} className="rounded-2xl bg-cyan-300 px-3 py-3 text-xs font-semibold text-[#031016]">
              Share Report
            </button>
            <button type="button" onClick={handleSaveDemo} className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-xs font-semibold text-white">
              Save Report
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function MobileApp() {
  const [view, setView] = useState<MobileView>('home');
  const [settings, setSettings] = useState<PkapSettings>(defaultSettings);

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#05070b] pb-24 text-white">
        <Dashboard onBack={() => setView('home')} />
        <BottomNav active={view} onChange={setView} />
      </div>
    );
  }

  if (view === 'analyze') {
    return (
      <div className="min-h-screen bg-[#05070b] pb-24 text-white">
        <PkapAnalyzerShell onBack={() => setView('home')} onOpenDashboard={() => setView('dashboard')} />
        <BottomNav active={view} onChange={setView} />
      </div>
    );
  }

  if (view === 'docs') {
    return (
      <div className="min-h-screen bg-[#05070b] pb-24 text-white">
        <TopBar title="Project Docs" onBack={() => setView('home')} />
        <DocsPage />
        <BottomNav active={view} onChange={setView} />
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="min-h-screen bg-[#05070b] pb-24 text-white">
        <TopBar title="App Controls" onBack={() => setView('home')} />
        <SettingsPage
          settings={settings}
          onChange={setSettings}
          onResetData={() => {
            localStorage.removeItem('pkap_history');
            localStorage.removeItem('pkap_analysis_data');
            localStorage.removeItem('pkap_settings');
          }}
        />
        <BottomNav active={view} onChange={setView} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <HomeScreen onNavigate={setView} />
      <BottomNav active={view} onChange={setView} />
    </div>
  );
}
