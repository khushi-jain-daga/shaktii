import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DashboardProps {
  onBack: () => void;
  onOpenPkap?: () => void;
}

type Tab = 'telemetry' | 'network' | 'logs' | 'policies';

const attackVectors = [
  { name: 'POLYMORPHIC SHELLCODE', count: '626', pct: 42, color: '#6e557d' },
  { name: 'SYN FLOOD & AMP DDoS', count: '417', pct: 28, color: '#8c93a2' },
  { name: 'DNS TUNNEL EXFILTRATION', count: '238', pct: 16, color: '#a8adb8' },
  { name: 'KERNEL HOOK HIJACK', count: '134', pct: 9, color: '#c4c8d4' },
  { name: 'BGP HIJACK ANOMALIES', count: '77', pct: 5, color: '#e2e6eb' },
];

const forensicEvents = [
  ['23:14:12', 'EDGE_PACKET_DROP', 'edge-gw-01', 'POLYMORPHIC_SHELLCODE', 'CRITICAL'],
  ['23:13:58', 'DNS_TUNNEL_BLOCKED', 'resolver-03', 'EXFIL_ATTEMPT', 'HIGH'],
  ['23:13:21', 'KERNEL_HOOK_DENIED', 'node-api-02', 'ROOTKIT_PATTERN', 'CRITICAL'],
  ['23:12:44', 'AUTH_TOKEN_REVOKED', 'iam-core', 'CREDENTIAL_REPLAY', 'HIGH'],
  ['23:11:09', 'BGP_ANOMALY_FLAGGED', 'mesh-router-08', 'ROUTE_HIJACK', 'MEDIUM'],
];

const policies = [
  ['T1110', 'BRUTE FORCE / CREDENTIAL ACCESS', 'Auto-throttle login attempts and revoke suspicious sessions.'],
  ['T1059', 'COMMAND AND SCRIPTING INTERPRETER', 'Isolate shells spawned from untrusted process chains.'],
  ['T1071', 'APPLICATION LAYER PROTOCOL', 'Block C2-like beaconing over HTTPS/DNS channels.'],
  ['T1041', 'EXFILTRATION OVER C2 CHANNEL', 'Stop abnormal outbound transfer and preserve incident evidence.'],
];

export default function Dashboard({ onBack, onOpenPkap }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('telemetry');
  const [time, setTime] = useState('');
  const [packetCount, setPacketCount] = useState(42819400);

  useEffect(() => {
    const updateTime = () => setTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPacketCount((prev) => prev + Math.floor(Math.random() * 240 + 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'telemetry', label: '01 // TELEMETRY & LIVE GRAPHS' },
    { id: 'network', label: '02 // NETWORK TOPOLOGY GRAPH' },
    { id: 'logs', label: '03 // EVENT LOGS & FORENSICS' },
    { id: 'policies', label: '04 // DEFENSE POLICIES & MITRE' },
  ];

  return (
    <div className="min-h-screen w-full relative bg-[#0a0b0d] bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:100px_100px] bg-[position:center_top] flex flex-col text-white font-mono overflow-x-hidden">
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[1] mix-blend-overlay opacity-20 bg-[url('/assets/textures/noise.png')] bg-repeat" />

      <header className="h-[78px] w-full max-w-[1520px] mx-auto px-6 sm:px-12 flex items-center justify-between border-b border-white/[0.06] z-20 relative">
        <div className="flex items-center gap-3">
          <img src="/pwn-shakti-logo.svg" alt="PWN Shakti" className="h-9 w-9 rounded-[7px] object-cover bg-white" />
          <span className="font-sans font-semibold text-[1.3rem] text-white tracking-[-0.01em]">SHAKTII</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-[11px] text-[#757b88]">{time}</div>
          {onOpenPkap && (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenPkap}
              className="bg-[#6e557d]/20 hover:bg-[#6e557d]/35 text-[#dcc8e8] font-mono text-[11.5px] px-3.5 py-1.5 rounded-[4px] border border-[#6e557d]/45 transition-colors cursor-pointer"
            >
              PKAP ANALYZER
            </motion.button>
          )}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={onBack}
            className="bg-white/10 hover:bg-white/20 text-white font-mono text-[11.5px] px-3.5 py-1.5 rounded-[4px] border border-white/15 transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>← Return to Site</span>
          </motion.button>
        </div>
      </header>

      <main className="flex-1 max-w-[1520px] w-full mx-auto px-6 sm:px-12 py-8 z-10 relative space-y-8">
        <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-[11.5px] tracking-[0.06em] px-3.5 py-2 rounded-[4px] border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#0a0b0d] font-bold border-white shadow-[0_2px_8px_rgba(255,255,255,0.25)]'
                  : 'bg-[#17191e]/40 text-[#8c93a2] border-white/10 hover:border-white/25 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'telemetry' && <TelemetryView packetCount={packetCount} />}
        {activeTab === 'network' && <NetworkView />}
        {activeTab === 'logs' && <LogsView />}
        {activeTab === 'policies' && <PoliciesView />}
      </main>

      <footer className="h-10 border-t border-white/[0.06] max-w-[1520px] w-full mx-auto px-6 sm:px-12 flex items-center justify-between text-[10.5px] text-[#555c69] z-10 relative">
        <div className="flex items-center gap-4">
          <span>SHAKTII eBPF KERNEL ENGINE: RUNNING</span>
          <span>//</span>
          <span>FIPS 140-3 HSM: SYNCHRONIZED</span>
        </div>
        <div>AUTONOMOUS DEFENSE ACTIVE • ZERO UNRESOLVED INCIDENTS</div>
      </footer>
    </div>
  );
}

function TelemetryView({ packetCount }: { packetCount: number }) {
  const stats = [
    { tag: '[THROUGHPUT]', val: `${(packetCount / 1000000).toFixed(2)}M`, unit: 'OPS / SEC', title: 'PACKET INGESTION RATE', desc: 'Hardware eBPF kernel pipeline' },
    { tag: '[LATENCY]', val: '< 0.02', unit: 'MILLISECONDS', title: 'EDGE RESPONSE TIME', desc: 'Deterministic zero-jitter bypass' },
    { tag: '[MITIGATED]', val: '1,492', unit: 'VECTORS TODAY', title: 'ZERO-DAYS CONTAINED', desc: '100% autonomous mitigation' },
    { tag: '[RESILIENCE]', val: '99.999%', unit: 'UPTIME SLA', title: 'GLOBAL MESH CONSENSUS', desc: '142 nodes active across 3 enclaves' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-[#17191e]/60 border border-white/[0.08] p-5 rounded-[6px] hover:border-white/20 transition-colors"
          >
            <div className="text-[10px] tracking-[0.12em] text-[#8c93a2] uppercase mb-2">{stat.tag}</div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stat.val}</span>
              <span className="text-[10px] text-[#6e557d] font-bold">{stat.unit}</span>
            </div>
            <div className="text-[11.5px] text-[#a8adb8] font-medium uppercase tracking-[0.04em]">{stat.title}</div>
            <div className="text-[10.5px] text-[#555c69] mt-2">{stat.desc}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#8a909d] mb-1">
                <span className="text-[9px] text-[#bdc3cf]">✦</span>
                <span>REAL-TIME TELEMETRY</span>
              </div>
              <h3 className="font-mono text-[16px] font-bold text-white uppercase tracking-tight">PACKET INGESTION & ZERO-DAY NEUTRALIZATION VELOCITY</h3>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-white"><span className="w-2.5 h-1 bg-[#6e557d] rounded-full" /><span>CLEAN TRAFFIC</span></div>
              <div className="flex items-center gap-1.5 text-[#a8adb8]"><span className="w-2.5 h-1 bg-[#a8adb8] rounded-full" /><span>INTERCEPTED</span></div>
            </div>
          </div>

          <div className="h-[260px] w-full relative">
            <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6e557d" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6e557d" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {[40, 90, 140, 190].map((y) => <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="4 4" />)}
              <polygon points="0,220 0,140 80,120 160,150 240,100 320,130 400,80 480,110 560,70 640,90 700,60 700,220" fill="url(#purpleGlow)" />
              <motion.path d="M0,140 Q40,110 80,120 T160,150 T240,100 T320,130 T400,80 T480,110 T560,70 T640,90 T700,60" fill="none" stroke="#6e557d" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut' }} />
              <motion.path d="M0,200 Q80,210 160,190 T240,210 T320,170 T400,200 T480,160 T560,190 T640,150 T700,180" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="400" cy="80" r="4" fill="#ffffff" />
              <circle cx="560" cy="70" r="4" fill="#ffffff" />
            </svg>
            <div className="flex justify-between font-mono text-[10px] text-[#555c69] pt-2">
              <span>-60s</span><span>-45s</span><span>-30s</span><span>-15s</span><span className="text-white">LIVE NOW</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6 flex flex-col justify-between">
          <div>
            <div className="font-mono text-[10.5px] text-[#8c93a2] tracking-[0.08em] uppercase mb-1">[VECTOR MITIGATION]</div>
            <h3 className="font-mono text-[16px] font-bold text-white uppercase tracking-tight mb-5">ATTACK BREAKDOWN (24H)</h3>
            <div className="space-y-4 font-mono text-[11.5px]">
              {attackVectors.map((v, i) => (
                <div key={v.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]"><span className="text-[#a8adb8]">{v.name}</span><span className="text-white font-medium">{v.count} ({v.pct}%)</span></div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${v.pct}%` }} transition={{ duration: 1, delay: i * 0.1 }} style={{ backgroundColor: v.color }} className="h-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-5 mt-4 border-t border-white/[0.06] font-mono text-[11px] text-[#757b88] flex items-center justify-between"><span>FALSE POSITIVE RATE:</span><span className="text-white font-bold">0.00008%</span></div>
        </div>
      </div>
    </div>
  );
}

function NetworkView() {
  const nodes = [
    [450, 250, 34, 'CORE'], [180, 130, 22, 'EDGE'], [720, 140, 22, 'AUTH'], [190, 380, 22, 'DB'], [710, 375, 22, 'WAF'], [450, 80, 18, 'DNS'], [450, 420, 18, 'EDR'],
  ] as const;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <div className="bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6 min-h-[520px] relative overflow-hidden">
        <div className="text-[11px] text-[#8c93a2] tracking-[0.08em] mb-4">NETWORK TOPOLOGY // LIVE TRUST GRAPH</div>
        <svg viewBox="0 0 900 450" className="w-full h-[430px]">
          <g stroke="#6e557d" strokeWidth="2" opacity="0.55">
            <line x1="450" y1="250" x2="180" y2="130"/><line x1="450" y1="250" x2="720" y2="140"/><line x1="450" y1="250" x2="190" y2="380"/><line x1="450" y1="250" x2="710" y2="375"/><line x1="450" y1="250" x2="450" y2="80"/><line x1="450" y1="250" x2="450" y2="420"/>
          </g>
          {nodes.map(([x,y,r,label],i)=><g key={label}><circle cx={x} cy={y} r={r} fill={i===0?'#6e557d':'#17191e'} stroke="#cbb6d7" strokeWidth="2"/><text x={x} y={y+4} textAnchor="middle" fill="white" fontSize="12">{label}</text></g>)}
        </svg>
      </div>
      <div className="space-y-4">
        {['EDGE-GW-01','AUTH-CLUSTER','DB-PRIMARY','WAF-MESH','EDR-SENSOR'].map((node,i)=><div key={node} className="bg-[#17191e]/60 border border-white/[0.08] rounded-[7px] p-5"><div className="flex justify-between text-[11px]"><span>{node}</span><span className="text-emerald-300">SYNCED</span></div><div className="text-[10px] text-[#666d79] mt-2">Trust score {99 - i * 4}% • autonomous policy active</div></div>)}
      </div>
    </div>
  );
}

function LogsView() {
  return (
    <div className="bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/[0.08] text-[12px] tracking-[0.1em] text-[#a8adb8]">EVENT LOGS & FORENSICS</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-[11px]">
          <thead className="text-[#666d79] border-b border-white/[0.08]"><tr>{['TIME','EVENT','SOURCE','SIGNATURE','SEVERITY'].map(h=><th key={h} className="px-6 py-4">{h}</th>)}</tr></thead>
          <tbody>{forensicEvents.map(row=><tr key={row[0]} className="border-b border-white/[0.05]">{row.map((cell,i)=><td key={i} className={`px-6 py-4 ${i===4?'text-[#cbb6d7] font-bold':'text-[#c9ced9]'}`}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function PoliciesView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {policies.map(([mitre,title,desc])=><div key={mitre} className="bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6"><div className="text-[10px] tracking-[0.12em] text-[#8c93a2] mb-3">MITRE {mitre}</div><h3 className="text-[15px] font-bold text-white uppercase mb-3">{title}</h3><p className="text-[13px] leading-[1.6] text-[#8a909d]">{desc}</p><div className="mt-5 flex justify-between text-[10px]"><span className="text-emerald-300">POLICY ENABLED</span><span className="text-[#cbb6d7]">AUTO RESPONSE</span></div></div>)}
    </div>
  );
}
