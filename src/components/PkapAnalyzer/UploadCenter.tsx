import { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileCode2, FileText, Loader2, LockKeyhole, ShieldCheck, Upload, X } from 'lucide-react';
import { anonymizeLogData, type RedactionLog } from '../../utils/pkapAnalyzer';

interface Props {
  onAnalyze: (fileName: string, rawData: string, redactedData: string, redactionLog: RedactionLog) => Promise<boolean>;
  isAnalyzing: boolean;
  onAnalysisComplete: () => void;
  onOpenDocs: () => void;
}

const acceptedExtensions = ['.log', '.txt', '.json', '.csv'];
const sampleLog = `2026-09-04T14:32:01Z INFO gateway request completed status=200\n2026-09-04T14:32:02Z ERROR sshd Failed password for invalid user admin from 185.220.101.45 port 54112\n2026-09-04T14:32:04Z WARN authentication anomaly: 22 failed attempts in 60 seconds from 185.220.101.45\n2026-09-04T14:32:05Z CRITICAL privilege escalation attempt detected user=svc-api source=185.220.101.45\n2026-09-04T14:32:07Z WARN outbound connection blocked destination=malicious-example.xyz\n2026-09-04T14:32:09Z INFO security policy containment triggered`;

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadCenter({ onAnalyze, isAnalyzing, onAnalysisComplete, onOpenDocs }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rawData, setRawData] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redactionPreview, setRedactionPreview] = useState<RedactionLog | null>(null);

  const loadText = (name: string, text: string, size = text.length) => {
    setFileName(name || 'pasted-log.txt');
    setRawData(text);
    setFileSize(size);
    setError(null);
    setRedactionPreview(anonymizeLogData(text).redactionLog);
  };

  const loadFile = async (file: File) => {
    const lower = file.name.toLowerCase();
    if (!acceptedExtensions.some((ext) => lower.endsWith(ext))) {
      setError('Unsupported file type. Use .log, .txt, .json or .csv.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('Files above 100 MB should be sampled before browser analysis.');
      return;
    }
    const text = await file.text();
    loadText(file.name, text, file.size);
  };

  const run = async () => {
    if (!rawData.trim() || isAnalyzing) return;
    setError(null);
    const { redactedData, redactionLog } = anonymizeLogData(rawData);
    try {
      const ok = await onAnalyze(fileName || 'pasted-log.txt', rawData, redactedData, redactionLog);
      if (ok) onAnalysisComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    }
  };

  return (
    <section className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 min-w-0">
      <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-7 items-start min-w-0">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.16em] text-[#8d6b9d] mb-3">INGESTION // PRIVACY-FIRST ANALYSIS</div>
          <h1 className="font-sans text-[clamp(2.7rem,6vw,5.8rem)] leading-[0.95] tracking-[-0.055em] font-semibold mb-6">Raw logs in.<br/><span className="text-[#8d6b9d]">Threat signal out.</span></h1>
          <p className="text-[13px] sm:text-[14px] leading-7 text-[#7c8490] max-w-[650px]">Upload or paste raw security telemetry. Pkap Analyzer redacts common sensitive values locally, correlates suspicious events, extracts IOCs, maps MITRE-style techniques, and builds an incident-ready report.</p>

          <div className="grid sm:grid-cols-3 gap-3 mt-8">
            {[
              [LockKeyhole, 'LOCAL REDACTION', 'PII / secrets masked before optional AI'],
              [ShieldCheck, 'DUAL ENGINE', 'AI providers + deterministic fallback'],
              [FileText, 'SOC REPORT', 'Findings, IOCs, remediation and export'],
            ].map(([Icon, title, copy]: any) => (
              <div key={title} className="rounded-[7px] border border-white/[0.07] bg-white/[0.02] p-4 min-w-0">
                <Icon size={17} className="text-[#a98abb] mb-3"/>
                <div className="text-[10px] tracking-[0.1em] text-white">{title}</div>
                <div className="text-[10px] leading-5 text-[#646d79] mt-2">{copy}</div>
              </div>
            ))}
          </div>

          <button onClick={onOpenDocs} className="mt-6 text-[11px] text-[#9a80a9] hover:text-[#c7afd2] cursor-pointer">Read analyzer architecture & privacy documentation →</button>
        </div>

        <div className="panel overflow-hidden min-w-0">
          <div className="panel-header flex items-center justify-between gap-4">
            <h2 className="panel-title flex items-center gap-2"><Upload size={16}/> Upload Center</h2>
            <span className="text-[9px] tracking-[0.1em] text-[#5f6673]">.LOG .TXT .JSON .CSV</span>
          </div>
          <div className="panel-body space-y-5 min-w-0">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files?.[0]; if (file) void loadFile(file); }}
              onClick={() => inputRef.current?.click()}
              className={`min-h-[210px] rounded-[7px] border border-dashed flex flex-col items-center justify-center text-center px-5 cursor-pointer transition-all ${dragging ? 'border-[#a98abb] bg-[#6e557d]/10' : 'border-white/[0.13] bg-[#0b0d10]/50 hover:border-white/25 hover:bg-white/[0.02]'}`}
            >
              <input ref={inputRef} type="file" accept=".log,.txt,.json,.csv,text/plain,application/json,text/csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void loadFile(file); e.currentTarget.value = ''; }}/>
              <div className="w-12 h-12 rounded-full border border-[#6e557d]/40 bg-[#6e557d]/10 flex items-center justify-center mb-4"><FileCode2 size={22} className="text-[#b79bc5]"/></div>
              <div className="text-sm font-semibold">Drop security logs here</div>
              <div className="text-[11px] text-[#626b77] mt-2">or click to select a file • up to 100 MB</div>
            </div>

            <div className="flex items-center gap-3 text-[9px] tracking-[0.13em] text-[#535b66]"><span className="h-px bg-white/[0.06] flex-1"/> OR PASTE RAW LOGS <span className="h-px bg-white/[0.06] flex-1"/></div>

            <textarea
              value={rawData}
              onChange={(e) => loadText(fileName || 'pasted-log.txt', e.target.value)}
              placeholder="Paste syslog, web access logs, JSON events, Windows events, authentication logs, kernel/runtime telemetry…"
              className="w-full min-h-[190px] resize-y rounded-[6px] border border-white/[0.08] bg-[#0a0b0d]/80 px-4 py-3 outline-none focus:border-[#6e557d]/70 text-[11px] leading-6 text-[#b8bec8] placeholder:text-[#464d57] font-mono"
            />

            <div className="flex flex-wrap gap-2">
              <button onClick={() => loadText('demo-security.log', sampleLog)} className="btn btn-outline text-[10px]">LOAD DEMO LOG</button>
              {(rawData || fileName) && <button onClick={() => { setRawData(''); setFileName(''); setFileSize(0); setRedactionPreview(null); setError(null); }} className="btn btn-outline text-[10px]"><X size={13}/> CLEAR</button>}
            </div>

            {fileName && (
              <div className="rounded-[6px] border border-white/[0.07] bg-white/[0.02] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0"><div className="text-[11px] text-white break-all">{fileName}</div><div className="text-[9px] text-[#5e6672] mt-1">{formatBytes(fileSize || rawData.length)} • {rawData.split('\n').length.toLocaleString()} lines</div></div>
                <CheckCircle2 size={18} className="text-emerald-300 shrink-0"/>
              </div>
            )}

            {redactionPreview && redactionPreview.total > 0 && (
              <div className="rounded-[6px] border border-[#6e557d]/25 bg-[#6e557d]/[0.06] px-4 py-3">
                <div className="text-[10px] tracking-[0.1em] text-[#b49ac1] mb-2">PRIVACY PRECHECK</div>
                <div className="text-[11px] text-[#8d95a1]">{redactionPreview.total} sensitive values detected for local masking — {redactionPreview.ips} IPs, {redactionPreview.emails} emails, {redactionPreview.tokens + redactionPreview.secrets} credentials/tokens.</div>
              </div>
            )}

            {error && <div className="rounded-[6px] border border-red-400/20 bg-red-500/[0.05] px-4 py-3 text-[11px] text-red-200 flex gap-2"><AlertTriangle size={15} className="shrink-0"/>{error}</div>}

            <button onClick={() => void run()} disabled={!rawData.trim() || isAnalyzing} className="w-full min-h-[48px] rounded-[6px] bg-[#6e557d] hover:bg-[#7c608c] disabled:bg-[#29262d] disabled:text-[#65616a] disabled:cursor-not-allowed border border-white/[0.08] text-[11px] tracking-[0.1em] font-bold cursor-pointer flex items-center justify-center gap-2">
              {isAnalyzing ? <><Loader2 size={16} className="animate-spin"/> ANALYZING / CORRELATING…</> : <><ShieldCheck size={16}/> INITIALIZE ANALYSIS</>}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
