import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { widrsxApi, type WidrsxLog } from '../../services/widrsxApi';

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

const fallbackEvents: ThreatEvent[] = [
  {
    id: 'DEMO-001',
    time: 'DEMO MODE',
    severity: 'INFO',
    vector: 'WIDRS-X backend is not connected',
    mitre: 'N/A',
    sourceIp: '—',
    targetNode: '—',
    action: 'START BACKEND ON PORT 5000',
    latency: '—',
    hexDump: 'Configure VITE_WIDRSX_API_URL if the backend is not running at http://localhost:5000',
  },
];

function normalizeSeverity(value?: string): ThreatEvent['severity'] {
  const severity = (value || '').toUpperCase();
  if (severity === 'CRITICAL' || severity === 'HIGH') return 'CRITICAL';
  if (severity === 'ELEVATED' || severity === 'MEDIUM') return 'ELEVATED';
  if (severity === 'CONTAINED' || severity === 'LOW') return 'CONTAINED';
  return 'INFO';
}

function parseMetadata(raw: WidrsxLog['metadata']): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function toThreatEvent(row: WidrsxLog): ThreatEvent {
  const metadata = parseMetadata(row.metadata);
  const ts = row.timestamp ? new Date(row.timestamp * 1000) : null;
  const src = row.src_ip || String(metadata.src_ip || metadata.source_ip || 'unknown');
  const dst = row.dst_ip || String(metadata.dst_ip || metadata.target || 'unknown');
  const attackType = row.attack_type || row.type || row.protocol || 'Network Event';

  return {
    id: String(row.id ?? `${row.timestamp}-${src}-${dst}`),
    time: ts && !Number.isNaN(ts.getTime()) ? `${ts.toISOString().substring(11, 23)} UTC` : '—',
    severity: normalizeSeverity(row.severity),
    vector: String(attackType).replaceAll('_', ' ').toUpperCase(),
    mitre: String(metadata.mitre || metadata.mitre_id || 'Not mapped'),
    sourceIp: src,
    targetNode: dst,
    action: String(metadata.action || metadata.response || (row.log_kind === 'attack' ? 'THREAT RECORDED' : 'OBSERVED')),
    latency: String(metadata.latency || '—'),
    hexDump: String(metadata.hex_dump || metadata.hex || row.description || `${src} -> ${dst}`),
  };
}

export default function EventLogs() {
  const [events, setEvents] = useState<ThreatEvent[]>(fallbackEvents);
  const [selectedEvent, setSelectedEvent] = useState<ThreatEvent | null>(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const rows = await widrsxApi.getLogs({ limit: 200 });
        if (!cancelled) {
          setEvents(rows.length ? rows.map(toThreatEvent) : []);
          setConnected(true);
        }
      } catch {
        if (!cancelled) {
          setConnected(false);
          setEvents(fallbackEvents);
        }
      }
    };

    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const filteredEvents = useMemo(
    () =>
      events.filter((e) => {
        const matchesSeverity = filterSeverity === 'ALL' || e.severity === filterSeverity;
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          e.vector.toLowerCase().includes(query) ||
          e.sourceIp.toLowerCase().includes(query) ||
          e.targetNode.toLowerCase().includes(query);
        return matchesSeverity && matchesSearch;
      }),
    [events, filterSeverity, searchQuery],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#17191e]/60 border border-white/[0.08] rounded-[8px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-mono text-[#8c93a2] uppercase tracking-[0.06em]">SEVERITY:</span>
          <div className="flex gap-1.5 font-mono text-[11px]">
            {['ALL', 'CRITICAL', 'ELEVATED', 'CONTAINED', 'INFO'].map((sev) => (
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
          <span className={`text-[10px] font-mono ${connected ? 'text-emerald-300' : 'text-amber-300'}`}>
            {connected ? '● WIDRS-X LIVE' : '● BACKEND OFFLINE'}
          </span>
          <input
            type="text"
            placeholder="Search vector, IP, or node..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0a0b0d] border border-white/10 focus:border-white/40 rounded-[4px] px-3 py-1.5 font-mono text-[12px] text-white placeholder-[#555c69] outline-none w-full sm:w-[260px]"
          />
        </div>
      </div>

      <div className="bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="font-mono text-[12px] text-white font-bold uppercase tracking-tight flex items-center gap-2">
            <span className="text-[10px] text-[#bdc3cf] leading-none">✦</span>
            <span>AUTONOMOUS THREAT INTERCEPTION LOGS</span>
          </div>
          <span className="font-mono text-[11px] text-[#8c93a2]">{filteredEvents.length} EVENTS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11.5px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-[#8c93a2] uppercase text-[10px] tracking-[0.06em]">
                <th className="px-5 py-3">TIMESTAMP</th>
                <th className="px-5 py-3">SEVERITY</th>
                <th className="px-5 py-3">THREAT VECTOR</th>
                <th className="px-5 py-3">SOURCE</th>
                <th className="px-5 py-3">TARGET</th>
                <th className="px-5 py-3">ACTION</th>
                <th className="px-5 py-3 text-right">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} onClick={() => setSelectedEvent(evt)} className="hover:bg-white/[0.03] transition-colors cursor-pointer group">
                  <td className="px-5 py-3 text-[#757b88] whitespace-nowrap">{evt.time}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold ${
                      evt.severity === 'CRITICAL'
                        ? 'bg-white text-black'
                        : evt.severity === 'ELEVATED'
                        ? 'bg-[#6e557d] text-white'
                        : evt.severity === 'CONTAINED'
                        ? 'bg-white/10 text-[#bdc3cf] border border-white/20'
                        : 'bg-white/5 text-[#8c93a2]'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white font-medium">{evt.vector}</td>
                  <td className="px-5 py-3 text-[#a8adb8]">{evt.sourceIp}</td>
                  <td className="px-5 py-3 text-[#757b88]">{evt.targetNode}</td>
                  <td className="px-5 py-3 text-white font-medium">{evt.action}</td>
                  <td className="px-5 py-3 text-right text-[#6e557d] group-hover:text-white">INSPECT →</td>
                </tr>
              ))}
              {!filteredEvents.length && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-[#757b88]">No events match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121418] border border-white/20 rounded-[10px] p-6 max-w-[700px] w-full font-mono text-[12px] shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
                <div>
                  <div className="text-[10.5px] text-[#8c93a2] uppercase tracking-[0.08em]">FORENSIC INCIDENT DISSECTION</div>
                  <div className="text-[16px] font-bold text-white mt-1">{selectedEvent.vector}</div>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px]">✕ CLOSE</button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#0a0b0d] p-3 rounded border border-white/[0.06]">
                    <span className="text-[#6d7482] block text-[10px]">MITRE ATT&CK</span>
                    <span className="text-white font-medium">{selectedEvent.mitre}</span>
                  </div>
                  <div className="bg-[#0a0b0d] p-3 rounded border border-white/[0.06]">
                    <span className="text-[#6d7482] block text-[10px]">RESPONSE</span>
                    <span className="text-white font-bold">{selectedEvent.action}</span>
                  </div>
                </div>
                <div className="bg-[#0a0b0d] p-3 rounded border border-white/[0.06]">
                  <span className="text-[#6d7482] block text-[10px] mb-1">RAW EVENT / EVIDENCE</span>
                  <div className="text-[11px] text-[#e2e6eb] bg-[#16181e] p-2.5 rounded border border-white/[0.04] break-all select-all">{selectedEvent.hexDump}</div>
                </div>
                <div className="flex items-center justify-between text-[#757b88] text-[11px] pt-2">
                  <span>LATENCY: {selectedEvent.latency}</span>
                  <span>{selectedEvent.time}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
