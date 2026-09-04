import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThreatEvent {
  id: string;
  time: string;
  severity: 'CRITICAL' | 'ELEVATED' | 'CONTAINED' | 'INFO';
  vector: string;
  mitre: string;
  sourceIp: string;
  targetNode: string;
  action: string;
  latency: string;
  hexDump: string;
}

const mockEvents: ThreatEvent[] = [
  {
    id: 'EVT-90412',
    time: '18:54:10.291 UTC',
    severity: 'CRITICAL',
    vector: 'CVE-2026-8819 eBPF PROBE HIJACK',
    mitre: 'T1055.008 - PTR_TO_STACK EXPLOIT',
    sourceIp: '185.220.101.44 (RU // TOR EXIT)',
    targetNode: 'NODE-ALPHA-US',
    action: 'KERNEL_HOOK_QUARANTINE',
    latency: '0.018ms',
    hexDump: '48 89 e5 48 83 ec 20 65 48 8b 04 25 28 00 00 00 48 89 45 f8 31 c0 e8 d7 fe ff ff',
  },
  {
    id: 'EVT-90411',
    time: '18:53:58.104 UTC',
    severity: 'ELEVATED',
    vector: 'SYN FLOOD AMP WITH SPOOFED BGP',
    mitre: 'T1498.001 - DIRECT NETWORK FLOOD',
    sourceIp: '94.102.61.18 (NL // PROXMOX BOTNET)',
    targetNode: 'ANYCAST-GATEWAY-A',
    action: 'SYNPROXY_SYNCOOKIE_DROP',
    latency: '0.009ms',
    hexDump: '45 00 00 3c 1a 2b 40 00 40 06 b2 a1 5e 66 3d 12 c6 29 80 05 04 d2 00 50 00 00 00 00',
  },
  {
    id: 'EVT-90410',
    time: '18:53:41.890 UTC',
    severity: 'CONTAINED',
    vector: 'DNS TUNNEL BASE64 PAYLOAD EXFIL',
    mitre: 'T1071.004 - DNS APPLICATION PROTOCOL',
    sourceIp: '10.240.4.19 (INTERNAL POD-88A)',
    targetNode: 'SOVEREIGN_CORE_01',
    action: 'PACKET_FILTER_ISOLATION',
    latency: '0.024ms',
    hexDump: '73 68 61 6b 74 69 69 2d 63 72 79 70 74 6f 2d 6b 65 79 2d 65 78 66 69 6c 74 72 61 74 65',
  },
  {
    id: 'EVT-90409',
    time: '18:52:19.452 UTC',
    severity: 'CONTAINED',
    vector: 'RAW TCP PORT KNOCK & PROBE SCAN',
    mitre: 'T1046 - NETWORK SERVICE DISCOVERY',
    sourceIp: '45.155.205.233 (DE // BULLETPROOF)',
    targetNode: 'NODE-BRAVO-EU',
    action: 'STEALTH_RST_RETURNED',
    latency: '0.012ms',
    hexDump: '00 1a 2b 3c 4d 5e 6f 70 81 92 a3 b4 08 00 45 00 00 28 00 01 00 00 40 06 7c cc c0 a8',
  },
  {
    id: 'EVT-90408',
    time: '18:51:02.119 UTC',
    severity: 'CRITICAL',
    vector: 'ZERO-DAY POLYMORPHIC MEMORY INJECTION',
    mitre: 'T1055 - PROCESS INJECTION',
    sourceIp: '194.26.29.112 (UA // UNKNOWN VENDOR)',
    targetNode: 'NODE-DELTA-IN',
    action: 'CONTAINER_TERMINATED_SIGKILL',
    latency: '0.031ms',
    hexDump: '31 c0 50 68 2f 2f 73 68 68 2f 62 69 6e 89 e3 50 53 89 e1 99 b0 0b cd 80 00 00 00 00',
  },
  {
    id: 'EVT-90407',
    time: '18:49:33.882 UTC',
    severity: 'INFO',
    vector: 'MUTUAL TLS 1.3 ROTATION COMPLETED',
    mitre: 'T1553 - SUBVERT TRUST STORES',
    sourceIp: '10.240.0.1 (SOVEREIGN HSM)',
    targetNode: 'ALL_NODES_MESH',
    action: 'CRYPTO_KEYS_RE-ENCRYPTED',
    latency: '0.005ms',
    hexDump: '16 03 03 00 38 01 00 00 34 03 03 4a 9f 82 c1 b3 7d 90 ee 51 b8 24 ac 78 01 e8 f9 00',
  },
];

export default function EventLogs() {
  const [events] = useState<ThreatEvent[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<ThreatEvent | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((e) => {
    const matchesSeverity = filterSeverity === 'ALL' || e.severity === filterSeverity;
    const matchesSearch =
      e.vector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sourceIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.targetNode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#17191e]/60 border border-white/[0.08] rounded-[8px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-mono text-[#8c93a2] uppercase tracking-[0.06em]">
            SEVERITY:
          </span>
          <div className="flex gap-1.5 font-mono text-[11px]">
            {['ALL', 'CRITICAL', 'ELEVATED', 'CONTAINED'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-[4px] border transition-colors cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-white text-[#0a0b0d] font-bold border-white'
                    : 'bg-[#0a0b0d]/60 text-[#8c93a2] border-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search vector, IP, or node..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0a0b0d] border border-white/10 focus:border-white/40 rounded-[4px] px-3 py-1.5 font-mono text-[12px] text-white placeholder-[#555c69] outline-none w-full sm:w-[260px]"
          />
        </div>
      </div>

      {/* Logs Stream Table */}
      <div className="bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="font-mono text-[12px] text-white font-bold uppercase tracking-tight flex items-center gap-2">
            <span className="text-[10px] text-[#bdc3cf] leading-none">✦</span>
            <span>AUTONOMOUS THREAT INTERCEPTION LOGS (LIVE STREAM)</span>
          </div>
          <span className="font-mono text-[11px] text-[#8c93a2]">
            {filteredEvents.length} INCIDENTS LOGGED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11.5px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-[#8c93a2] uppercase text-[10px] tracking-[0.06em]">
                <th className="px-5 py-3">TIMESTAMP</th>
                <th className="px-5 py-3">SEVERITY</th>
                <th className="px-5 py-3">THREAT VECTOR</th>
                <th className="px-5 py-3">SOURCE ATTACKER</th>
                <th className="px-5 py-3">TARGET</th>
                <th className="px-5 py-3">ACTION</th>
                <th className="px-5 py-3">LATENCY</th>
                <th className="px-5 py-3 text-right">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredEvents.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3 text-[#757b88]">{evt.time}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-white text-black font-bold'
                          : evt.severity === 'ELEVATED'
                          ? 'bg-[#6e557d] text-white font-bold'
                          : evt.severity === 'CONTAINED'
                          ? 'bg-white/10 text-[#bdc3cf] border border-white/20'
                          : 'bg-white/5 text-[#8c93a2]'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white font-medium group-hover:text-[#bdc3cf]">
                    {evt.vector}
                  </td>
                  <td className="px-5 py-3 text-[#a8adb8]">{evt.sourceIp}</td>
                  <td className="px-5 py-3 text-[#757b88]">{evt.targetNode}</td>
                  <td className="px-5 py-3 text-white font-medium">
                    {evt.action}
                  </td>
                  <td className="px-5 py-3 text-[#8c93a2]">{evt.latency}</td>
                  <td className="px-5 py-3 text-right text-[#6e557d] group-hover:text-white transition-colors">
                    INSPECT →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Modal / Drawer */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121418] border border-white/20 rounded-[10px] p-6 max-w-[700px] w-full font-mono text-[12px] shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
                <div>
                  <div className="text-[10.5px] text-[#8c93a2] uppercase tracking-[0.08em]">
                    FORENSIC INCIDENT DISSECTION
                  </div>
                  <div className="text-[16px] font-bold text-white mt-1">
                    {selectedEvent.vector}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] cursor-pointer"
                >
                  ✕ CLOSE
                </button>
              </div>

              <div className="space-y-4 text-[12px]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0a0b0d] p-3 rounded border border-white/[0.06]">
                    <span className="text-[#6d7482] block text-[10px]">MITRE ATT&CK FRAMEWORK</span>
                    <span className="text-white font-medium">{selectedEvent.mitre}</span>
                  </div>
                  <div className="bg-[#0a0b0d] p-3 rounded border border-white/[0.06]">
                    <span className="text-[#6d7482] block text-[10px]">KERNEL ACTION TAKEN</span>
                    <span className="text-white font-bold">{selectedEvent.action}</span>
                  </div>
                </div>

                <div className="bg-[#0a0b0d] p-3 rounded border border-white/[0.06]">
                  <span className="text-[#6d7482] block text-[10px] mb-1">INTERCEPTED PACKET HEX DUMP (RAW WIRE)</span>
                  <div className="font-mono text-[11px] text-[#e2e6eb] bg-[#16181e] p-2.5 rounded border border-white/[0.04] break-all select-all">
                    {selectedEvent.hexDump}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[#757b88] text-[11px] pt-2">
                  <span>RESPONSE LATENCY: {selectedEvent.latency}</span>
                  <span>RECORDED TIME: {selectedEvent.time}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
