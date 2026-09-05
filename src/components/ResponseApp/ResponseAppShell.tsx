import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import BrandLogo from '../common/BrandLogo';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type ActionStatus = 'auto-executed' | 'needs-approval' | 'pending' | 'rollback-available';

type TimelineEvent = {
  time: string;
  title: string;
  detail: string;
  severity: Severity;
};

type ContainmentAction = {
  id: string;
  title: string;
  detail: string;
  status: ActionStatus;
};

type Incident = {
  id: string;
  title: string;
  source: string;
  riskScore: number;
  confidence: number;
  severity: Severity;
  currentStage: string;
  predictedStage: string;
  slaMinutes: number;
  owner: string;
  createdAt: string;
  iocs: string[];
  summary: string;
  timeline: TimelineEvent[];
  actions: ContainmentAction[];
};

const incidents: Incident[] = [
  {
    id: 'INC-2026-0905-001',
    title: 'Admin Credential Compromise Chain',
    source: 'pkap-gateway-logs',
    riskScore: 94,
    confidence: 87,
    severity: 'critical',
    currentStage: 'Brute Force → Admin Login → Privilege Escalation',
    predictedStage: 'Data Exfiltration + Persistence Attempt',
    slaMinutes: 5,
    owner: 'Primary SOC Admin',
    createdAt: '09:50 PM',
    iocs: ['185.220.101.45', 'web-02', 'admin_session_7f3', 'api-key-create'],
    summary:
      'Repeated failed authentication attempts were followed by a successful admin login, key creation, sensitive endpoint access and suspicious outbound lookup. SHAKTII predicts likely exfiltration or persistence as the next stage.',
    timeline: [
      { time: '21:35', title: 'Failed login burst', detail: 'Multiple failed login attempts detected from one external IP.', severity: 'high' },
      { time: '21:37', title: 'Admin login success', detail: 'Successful admin session created after brute-force pattern.', severity: 'critical' },
      { time: '21:39', title: 'Privilege activity', detail: 'New admin-level API key creation event observed.', severity: 'critical' },
      { time: '21:43', title: 'Sensitive route access', detail: 'Export endpoint and internal asset metadata requested.', severity: 'high' },
      { time: '21:49', title: 'Suspicious outbound lookup', detail: 'Potential C2/persistence indicator seen in DNS telemetry.', severity: 'high' },
    ],
    actions: [
      { id: 'A1', title: 'Temporary IP Block', detail: 'Block 185.220.101.45 for 30 minutes at WAF/firewall layer.', status: 'auto-executed' },
      { id: 'A2', title: 'Freeze Admin Session', detail: 'Freeze admin_session_7f3 and require re-authentication.', status: 'auto-executed' },
      { id: 'A3', title: 'Force MFA Reset', detail: 'Require step-up verification for affected admin account.', status: 'needs-approval' },
      { id: 'A4', title: 'Revoke New API Key', detail: 'Revoke key created after suspicious login chain.', status: 'needs-approval' },
      { id: 'A5', title: 'Host Isolation', detail: 'Move web-02 to restricted network segment until reviewed.', status: 'pending' },
    ],
  },
  {
    id: 'INC-2026-0905-002',
    title: 'Unusual Port Scan Against Edge Node',
    source: 'network-sensor-01',
    riskScore: 72,
    confidence: 78,
    severity: 'high',
    currentStage: 'Reconnaissance',
    predictedStage: 'Exploit Attempt Against Public Service',
    slaMinutes: 15,
    owner: 'Network Admin',
    createdAt: '09:18 PM',
    iocs: ['45.142.120.11', 'edge-node-01', 'ports:22,80,443,8080'],
    summary: 'Edge node received abnormal sequential scan activity. Risk is high but containment is currently limited to rate limiting and monitoring.',
    timeline: [
      { time: '21:11', title: 'Scan detected', detail: 'Sequential requests across exposed ports.', severity: 'medium' },
      { time: '21:14', title: 'Service fingerprinting', detail: 'HTTP headers and version probing pattern observed.', severity: 'high' },
      { time: '21:18', title: 'Rate limit applied', detail: 'Traffic slowed while evidence is collected.', severity: 'medium' },
    ],
    actions: [
      { id: 'B1', title: 'Rate Limit Source', detail: 'Throttle suspicious source traffic for 20 minutes.', status: 'auto-executed' },
      { id: 'B2', title: 'Harden Edge Rules', detail: 'Apply stricter request filtering to scanned services.', status: 'needs-approval' },
    ],
  },
];

const severityClass: Record<Severity, string> = {
  critical: 'border-red-500/50 bg-red-500/10 text-red-200',
  high: 'border-orange-400/50 bg-orange-400/10 text-orange-100',
  medium: 'border-yellow-300/50 bg-yellow-300/10 text-yellow-100',
  low: 'border-emerald-300/50 bg-emerald-300/10 text-emerald-100',
};

const statusClass: Record<ActionStatus, string> = {
  'auto-executed': 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  'needs-approval': 'border-yellow-300/40 bg-yellow-300/10 text-yellow-100',
  pending: 'border-white/20 bg-white/5 text-white/70',
  'rollback-available': 'border-sky-300/40 bg-sky-300/10 text-sky-100',
};

interface ResponseAppShellProps {
  onBack: () => void;
}

export default function ResponseAppShell({ onBack }: ResponseAppShellProps) {
  const [selectedId, setSelectedId] = useState(incidents[0].id);
  const [acknowledged, setAcknowledged] = useState(false);
  const [contained, setContained] = useState(false);
  const selected = useMemo(() => incidents.find((incident) => incident.id === selectedId) ?? incidents[0], [selectedId]);

  const executedCount = selected.actions.filter((action) => action.status === 'auto-executed').length + (contained ? 2 : 0);

  return (
    <main className="min-h-screen bg-[#05060a] text-white font-mono overflow-x-hidden">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05060a]/90 backdrop-blur-xl">
        <div className="max-w-[1520px] mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between gap-4">
          <button onClick={onBack} className="text-[11px] tracking-[0.18em] uppercase text-white/60 hover:text-white transition-colors">
            ← Return to Site
          </button>
          <BrandLogo heightClassName="h-9 sm:h-11" />
          <div className="hidden md:flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase text-white/45">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Forecast-to-Response Engine
          </div>
        </div>
      </header>

      <section className="max-w-[1520px] mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-purple-200/70 mb-3">Autonomous Incident Response Application</p>
            <h1 className="font-sans text-3xl sm:text-5xl font-semibold tracking-[-0.04em]">Incident Command Center</h1>
            <p className="max-w-3xl mt-4 text-sm sm:text-base text-white/55 leading-7">
              Backend-ready GUI for alert acknowledgement, attack forecasting, escalation and safe containment. Replace mock data with Docker APIs when backend is connected.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 min-w-[310px]">
            <Metric label="Active Incidents" value="02" />
            <Metric label="Critical Risk" value="94" />
            <Metric label="Auto Actions" value={String(executedCount).padStart(2, '0')} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
          <aside className="space-y-4">
            {incidents.map((incident) => (
              <button
                key={incident.id}
                onClick={() => {
                  setSelectedId(incident.id);
                  setAcknowledged(false);
                  setContained(false);
                }}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${selected.id === incident.id ? 'border-purple-300/50 bg-purple-500/12 shadow-[0_0_30px_rgba(124,58,237,0.15)]' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'}`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[10px] text-white/45">{incident.id}</span>
                  <span className={`px-2 py-1 rounded-full border text-[9px] uppercase tracking-[0.12em] ${severityClass[incident.severity]}`}>{incident.severity}</span>
                </div>
                <h2 className="font-sans text-lg font-semibold tracking-[-0.02em]">{incident.title}</h2>
                <p className="mt-2 text-xs text-white/45 leading-5">{incident.source} • {incident.createdAt}</p>
                <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-orange-400 to-red-500" style={{ width: `${incident.riskScore}%` }} />
                </div>
              </button>
            ))}
          </aside>

          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-red-400/25 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.18),transparent_38%),rgba(255,255,255,0.035)] p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-[0.16em] ${severityClass[selected.severity]}`}>{selected.severity} Incident</span>
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-[0.16em] text-white/55">{selected.id}</span>
                  </div>
                  <h2 className="font-sans text-2xl sm:text-4xl font-semibold tracking-[-0.04em]">{selected.title}</h2>
                  <p className="mt-4 text-sm text-white/58 leading-7 max-w-4xl">{selected.summary}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 min-w-[250px]">
                  <Metric label="Risk Score" value={`${selected.riskScore}/100`} danger />
                  <Metric label="Confidence" value={`${selected.confidence}%`} />
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Panel title="Attack Forecast" className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ForecastBox label="Current Attack Stage" value={selected.currentStage} />
                  <ForecastBox label="Predicted Next Stage" value={selected.predictedStage} danger />
                </div>
                <div className="mt-5 rounded-2xl border border-purple-300/20 bg-purple-400/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-purple-100/75 mb-2">Why this matters</p>
                  <p className="text-sm leading-6 text-white/62">
                    SHAKTII does not wait for manual dashboard monitoring. It forecasts the next stage and starts escalation or containment when risk crosses policy thresholds.
                  </p>
                </div>
              </Panel>

              <Panel title="Acknowledgement SLA">
                <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Awaiting admin response</p>
                  <p className="font-sans text-4xl font-semibold mt-2">{acknowledged ? 'ACK' : '04:12'}</p>
                  <p className="text-xs text-white/45 mt-2">Escalates after {selected.slaMinutes} minutes if not acknowledged.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <ActionButton onClick={() => setAcknowledged(true)}>Acknowledge</ActionButton>
                  <ActionButton onClick={() => setContained(true)} danger>Contain</ActionButton>
                </div>
                <button className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.14em] text-white/65 hover:text-white hover:bg-white/[0.07]">
                  Escalate to Backup SOC
                </button>
              </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Panel title="Attack Timeline">
                <div className="space-y-4">
                  {selected.timeline.map((event, index) => (
                    <div key={`${event.time}-${event.title}`} className="flex gap-4">
                      <div className="w-14 text-xs text-white/40 pt-1">{event.time}</div>
                      <div className="relative pl-5 border-l border-white/10 pb-4">
                        <span className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border ${severityClass[event.severity]}`} />
                        <h3 className="font-sans text-base font-semibold tracking-[-0.02em]">{event.title}</h3>
                        <p className="text-xs text-white/48 leading-5 mt-1">{event.detail}</p>
                        {index === selected.timeline.length - 1 && <span className="text-[10px] uppercase tracking-[0.14em] text-purple-200/70 mt-2 inline-block">Forecast trigger point</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Safe Containment Playbook">
                <div className="space-y-3">
                  {selected.actions.map((action) => {
                    const status = contained && action.status === 'pending' ? 'rollback-available' : action.status;
                    return (
                      <div key={action.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-sans text-base font-semibold">{action.title}</h3>
                            <p className="text-xs text-white/48 leading-5 mt-1">{action.detail}</p>
                          </div>
                          <span className={`shrink-0 px-2 py-1 rounded-full border text-[9px] uppercase tracking-[0.12em] ${statusClass[status]}`}>{status.replace('-', ' ')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>

            <Panel title="Backend Integration Contract">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-white/58">
                <CodeCard title="Ingest" lines={['POST /api/ingest-log', 'creates incident', 'stores cleaned logs']} />
                <CodeCard title="Monitor" lines={['GET /api/incidents', 'GET /api/live-console', 'streams risk events']} />
                <CodeCard title="Respond" lines={['POST /api/acknowledge', 'POST /api/contain-threat', 'POST /api/escalate']} />
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${danger ? 'border-red-400/25 bg-red-500/10' : 'border-white/10 bg-white/[0.035]'}`}>
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="font-sans text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-white/[0.035] p-5 ${className}`}>
      <h2 className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function ForecastBox({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${danger ? 'border-red-400/25 bg-red-500/10' : 'border-white/10 bg-white/[0.035]'}`}>
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/40 mb-2">{label}</p>
      <p className="font-sans text-xl font-semibold leading-7 tracking-[-0.03em]">{value}</p>
    </div>
  );
}

function ActionButton({ children, onClick, danger = false }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`rounded-xl px-4 py-3 text-xs uppercase tracking-[0.14em] transition-colors ${danger ? 'bg-red-500/20 border border-red-300/30 text-red-100 hover:bg-red-500/30' : 'bg-purple-500/20 border border-purple-300/30 text-purple-100 hover:bg-purple-500/30'}`}>
      {children}
    </button>
  );
}

function CodeCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="font-sans text-base text-white mb-3">{title}</p>
      <div className="space-y-2">
        {lines.map((line) => (
          <code key={line} className="block rounded-lg bg-white/[0.04] px-3 py-2 text-[11px] text-purple-100/85">
            {line}
          </code>
        ))}
      </div>
    </div>
  );
}
