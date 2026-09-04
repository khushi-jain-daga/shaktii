import { Clock, FileText, Shield, Trash2 } from 'lucide-react';
import ReportDashboard from './ReportDashboard';
import type { StoredPkapAnalysis } from './PkapAnalyzerShell';

interface Props {
  history: StoredPkapAnalysis[];
  selectedId: string | null;
  onOpenReport: (report: StoredPkapAnalysis) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
  onNewAnalysis: () => void;
}

function highestThreat(report: StoredPkapAnalysis) {
  const b = report.severityBreakdown;
  if (b.critical > 0) return 'Critical';
  if (b.high > 0) return 'High';
  if (b.medium > 0) return 'Medium';
  if (b.low > 0) return 'Low';
  return 'Info';
}

function badgeClass(level: string) {
  if (level === 'Critical') return 'text-red-300 border-red-400/30 bg-red-500/10';
  if (level === 'High') return 'text-orange-200 border-orange-400/30 bg-orange-500/10';
  if (level === 'Medium') return 'text-yellow-200 border-yellow-300/25 bg-yellow-400/10';
  if (level === 'Low') return 'text-blue-200 border-blue-300/20 bg-blue-400/10';
  return 'text-[#9da4b0] border-white/10 bg-white/[0.03]';
}

export default function HistoryPage({ history, selectedId, onOpenReport, onClear, onDelete, onNewAnalysis }: Props) {
  const selected = history.find((item) => item.id === selectedId) || history[0] || null;

  return (
    <section className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-10 py-8 min-w-0">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.16em] text-[#8d6b9d] mb-2">REPORT ARCHIVE // LOCAL WORKSPACE</div>
          <h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.035em]">Reports History</h1>
          <p className="text-[12px] sm:text-[13px] text-[#747c89] mt-2 max-w-[760px]">Open previous analyses inside a bounded report workspace with full findings, statistics, investigation and export actions.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onNewAnalysis} className="btn btn-primary"><Shield size={14}/> Analyze New Log</button>
          {history.length > 0 && <button onClick={onClear} className="btn btn-outline"><Trash2 size={14}/> Clear History</button>}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="panel min-h-[420px] flex flex-col items-center justify-center text-center px-6">
          <FileText size={54} className="text-[#6e557d] opacity-50 mb-5" />
          <h2 className="text-lg font-semibold">No Reports Yet</h2>
          <p className="text-[#6f7784] text-sm mt-2 mb-6">Your past Pkap Analyzer reports will appear here.</p>
          <button onClick={onNewAnalysis} className="btn btn-primary">Analyze New Log</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-5 items-start min-w-0">
          <aside className="panel overflow-hidden min-w-0 lg:sticky lg:top-[136px]">
            <div className="px-4 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold"><FileText size={16} className="text-[#8d6b9d]"/> History</div>
              <span className="text-[10px] text-[#5f6673]">{history.length} REPORTS</span>
            </div>
            <div className="max-h-[620px] overflow-y-auto">
              {history.map((report) => {
                const active = selected?.id === report.id;
                const level = highestThreat(report);
                return (
                  <div key={report.id} className={`group border-b border-white/[0.05] border-l-[3px] ${active ? 'border-l-[#8d6b9d] bg-[#6e557d]/10' : 'border-l-transparent hover:bg-white/[0.02]'}`}>
                    <button onClick={() => onOpenReport(report)} className="w-full text-left px-4 py-4 cursor-pointer">
                      <div className="flex gap-3 items-start justify-between">
                        <div className="font-medium text-[13px] text-white break-all leading-5">{report.fileName || 'Unknown File'}</div>
                        <span className={`shrink-0 px-2 py-1 rounded-[4px] border text-[9px] font-bold uppercase ${badgeClass(level)}`}>{level}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-[#6f7784]">
                        <span className="border border-red-400/20 bg-red-500/[0.05] text-red-300 px-2 py-1 rounded-[3px]">RISK {report.metadata.overallRiskScore}/100</span>
                        <span className="flex items-center gap-1"><Clock size={11}/>{new Date(report.timestamp).toLocaleDateString()}</span>
                      </div>
                    </button>
                    <div className="px-4 pb-3 -mt-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onDelete(report.id)} className="text-[10px] text-[#6f7784] hover:text-red-300 cursor-pointer flex items-center gap-1"><Trash2 size={11}/> delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0">
            {selected ? (
              <div className="min-w-0 max-w-[1200px] mx-auto">
                <ReportDashboard data={selected} onReset={onNewAnalysis} />
              </div>
            ) : (
              <div className="panel min-h-[520px] flex flex-col items-center justify-center text-[#6f7784]">
                <FileText size={48} className="opacity-20 mb-4"/>
                <div>Select a report from the list.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
