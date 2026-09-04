import { useEffect, useMemo, useState } from 'react';
import { Activity, BookOpen, Database, FileText, Home, Settings, Shield, Upload } from 'lucide-react';
import UploadCenter from './UploadCenter';
import ReportDashboard from './ReportDashboard';
import HistoryPage from './HistoryPage';
import ThreatIntelPage from './ThreatIntelPage';
import DocsPage from './DocsPage';
import SettingsPage, { defaultSettings, type PkapSettings } from './SettingsPage';
import { analyzeLogHeuristically, type LogAnalysis, type RedactionLog } from '../../utils/pkapAnalyzer';

export type PkapView = 'upload' | 'report' | 'history' | 'intel' | 'docs' | 'settings';

export interface StoredPkapAnalysis extends LogAnalysis {
  id: string;
  timestamp: string;
  fileName: string;
  fileStats: { size: number; lines: number };
  redactionLog: RedactionLog;
  aiFallback?: boolean;
  aiError?: string | null;
  providerUsed?: string;
}

interface Props {
  onBack: () => void;
  onOpenDashboard?: () => void;
}

const HISTORY_KEY = 'pkap_history';
const SESSION_KEY = 'pkap_analysis_data';
const SETTINGS_KEY = 'pkap_settings';

const NAV = [
  { id: 'upload' as const, label: '01 // UPLOAD CENTER', icon: Upload },
  { id: 'report' as const, label: '02 // REPORT', icon: Activity },
  { id: 'history' as const, label: '03 // REPORTS HISTORY', icon: FileText },
  { id: 'intel' as const, label: '04 // THREAT INTEL', icon: Database },
  { id: 'docs' as const, label: '05 // DOCUMENTATION', icon: BookOpen },
  { id: 'settings' as const, label: '06 // SETTINGS', icon: Settings },
];

function safeHistory(): StoredPkapAnalysis[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as StoredPkapAnalysis[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeSettings(): PkapSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') as Partial<PkapSettings> | null;
    return parsed ? { ...defaultSettings, ...parsed } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export default function PkapAnalyzerShell({ onBack, onOpenDashboard }: Props) {
  const [view, setView] = useState<PkapView>('upload');
  const [analysisData, setAnalysisData] = useState<StoredPkapAnalysis | null>(null);
  const [history, setHistory] = useState<StoredPkapAnalysis[]>([]);
  const [settings, setSettings] = useState<PkapSettings>(defaultSettings);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    setHistory(safeHistory());
    setSettings(safeSettings());
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) setAnalysisData(JSON.parse(saved) as StoredPkapAnalysis);
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const update = () => setTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const themeClass = settings.darkMode ? '' : ' pkap-light';

  const saveHistory = (entry: StoredPkapAnalysis) => {
    let next = [entry, ...safeHistory().filter((item) => item.id !== entry.id)];
    if (settings.autoDelete) {
      const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
      next = next.filter((item) => new Date(item.timestamp).getTime() >= cutoff);
    }
    next = next.slice(0, 30);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    setHistory(next);
  };

  const handleAnalyze = async (fileName: string, rawData: string, redactedData: string, redactionLog: RedactionLog) => {
    setIsAnalyzing(true);
    let analysis = analyzeLogHeuristically(fileName, rawData, settings.strictCompliance);
    let aiFallback = true;
    let aiError: string | null = null;
    let providerUsed = 'Local deterministic parser';

    if (settings.aiAssist) {
      try {
        const response = await fetch('/api/pkap-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, redactedData }),
        });
        if (response.ok) {
          const payload = await response.json() as { success?: boolean; analysis?: LogAnalysis; aiFallback?: boolean; aiError?: string; providerUsed?: string };
          if (payload.success && payload.analysis) {
            analysis = payload.analysis;
            aiFallback = Boolean(payload.aiFallback);
            aiError = payload.aiError || null;
            providerUsed = payload.providerUsed || (aiFallback ? 'Local deterministic parser' : 'AI provider');
          }
        } else {
          aiError = `Analysis API returned ${response.status}`;
        }
      } catch (error) {
        aiError = error instanceof Error ? error.message : 'Analysis API unavailable in Vite development mode.';
      }
    }

    const finalPayload: StoredPkapAnalysis = {
      ...analysis,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      fileName,
      fileStats: { size: rawData.length, lines: rawData.split('\n').length },
      redactionLog,
      aiFallback,
      aiError,
      providerUsed,
    };

    if (settings.strictCompliance && finalPayload.metadata.overallRiskScore < 75 && (finalPayload.severityBreakdown.critical > 0 || finalPayload.severityBreakdown.high > 0)) {
      finalPayload.metadata.overallRiskScore = 75;
    }

    setAnalysisData(finalPayload);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(finalPayload)); } catch { /* session quota can be lower than large logs */ }
    saveHistory({ ...finalPayload, findings: finalPayload.findings.slice(0, 60) });
    setIsAnalyzing(false);

    if (settings.pushNotifications && finalPayload.metadata.overallRiskScore >= 85 && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Pkap Analyzer', { body: `Critical risk score ${finalPayload.metadata.overallRiskScore}/100 detected in ${fileName}.` });
      }
    }
    return true;
  };

  const openReport = (report: StoredPkapAnalysis) => {
    setAnalysisData(report);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(report)); } catch { /* ignore quota */ }
    setView('report');
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  const removeHistoryItem = (id: string) => {
    const next = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    setHistory(next);
    if (analysisData?.id === id) setAnalysisData(null);
  };

  const pageTitle = useMemo(() => NAV.find((item) => item.id === view)?.label.replace(/^\d+ \/\/ /, '') || 'PKAP ANALYZER', [view]);

  return (
    <div className={`pkap-root${themeClass} min-h-screen w-full overflow-x-hidden bg-[#0a0b0d] text-white font-mono relative`}>
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:100px_100px]" />
      <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[url('/assets/textures/noise.png')] bg-repeat" />

      <header className="relative z-30 border-b border-white/[0.06] bg-[#0a0b0d]/90 backdrop-blur-xl">
        <div className="h-[78px] max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-[27px] h-[27px] rounded-[6px] bg-white flex items-center justify-center shrink-0">
              <div className="w-[17px] h-[10px] bg-[#0a0b0d] rounded-full -rotate-35 relative"><div className="w-[3.5px] h-[3.5px] rounded-full bg-white absolute left-[3px] bottom-[2px]" /></div>
            </div>
            <div className="min-w-0">
              <div className="font-sans font-semibold text-[1.15rem] sm:text-[1.3rem] truncate">SHAKTII <span className="text-[#8d6b9d]">/ PKAP ANALYZER</span></div>
              <div className="hidden sm:block text-[9px] tracking-[0.15em] text-[#5f6673] mt-0.5">{pageTitle} // SECURITY ANALYSIS WORKSPACE</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden lg:block text-[10px] text-[#646b77]">{time}</div>
            {onOpenDashboard && (
              <button onClick={onOpenDashboard} className="hidden md:inline-flex px-3 py-2 rounded-[4px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-[10px] tracking-[0.08em] cursor-pointer">
                LIVE CONSOLE
              </button>
            )}
            <button onClick={onBack} className="px-3 py-2 rounded-[4px] border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[10px] sm:text-[11px] cursor-pointer flex items-center gap-2">
              <Home size={14} /> <span className="hidden sm:inline">RETURN TO SITE</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-20 border-b border-white/[0.06] bg-[#0d0f12]/75 backdrop-blur-md sticky top-0">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-12 py-3 overflow-x-auto [scrollbar-width:none]">
          <div className="flex gap-2 min-w-max">
            {NAV.map((item) => {
              const Icon = item.icon;
              const disabled = item.id === 'report' && !analysisData;
              return (
                <button
                  key={item.id}
                  disabled={disabled}
                  onClick={() => !disabled && setView(item.id)}
                  className={`text-[10px] sm:text-[11px] tracking-[0.06em] px-3 py-2 rounded-[4px] border transition-all flex items-center gap-2 ${
                    view === item.id
                      ? 'bg-white text-[#0a0b0d] border-white font-bold'
                      : disabled
                        ? 'border-white/[0.04] text-[#3d424b] cursor-not-allowed'
                        : 'border-white/10 bg-[#17191e]/50 text-[#8c93a2] hover:text-white hover:border-white/25 cursor-pointer'
                  }`}
                >
                  <Icon size={13} /> {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="relative z-10 min-w-0">
        {view === 'upload' && (
          <UploadCenter
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            onAnalysisComplete={() => setView('report')}
            onOpenDocs={() => setView('docs')}
          />
        )}

        {view === 'report' && analysisData && (
          <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-w-0">
            {analysisData.aiFallback && (
              <div className="mb-5 rounded-[6px] border border-orange-400/25 bg-orange-400/[0.06] px-4 py-3 text-[12px] text-[#c0c5ce] flex items-start gap-3">
                <Shield size={16} className="text-orange-300 shrink-0 mt-0.5" />
                <div><strong className="text-orange-200">Local Parser Mode Active.</strong> The deterministic engine produced this report because external AI was unavailable or not configured. Full UI and local analysis remain functional.</div>
              </div>
            )}
            <ReportDashboard data={analysisData} onReset={() => { setAnalysisData(null); sessionStorage.removeItem(SESSION_KEY); setView('upload'); }} />
          </div>
        )}

        {view === 'history' && (
          <HistoryPage
            history={history}
            selectedId={analysisData?.id || null}
            onOpenReport={openReport}
            onClear={clearHistory}
            onDelete={removeHistoryItem}
            onNewAnalysis={() => setView('upload')}
          />
        )}

        {view === 'intel' && <ThreatIntelPage />}
        {view === 'docs' && <DocsPage />}
        {view === 'settings' && <SettingsPage settings={settings} onChange={setSettings} onResetData={() => { clearHistory(); sessionStorage.removeItem(SESSION_KEY); setAnalysisData(null); }} />}
      </main>
    </div>
  );
}
