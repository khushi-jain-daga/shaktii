import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { nodeApi, type SecurityEvent } from '../services/nodeApi';

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [overview, setOverview] = useState({ total: 0, open: 0, critical: 0, high: 0 });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [summary, rows] = await Promise.all([nodeApi.securityOverview(), nodeApi.securityEvents()]);
      setOverview(summary);
      setEvents(rows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const cards = [
    ['Total events', overview.total],
    ['Open', overview.open],
    ['Critical', overview.critical],
    ['High', overview.high],
  ] as const;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-400">Threat operations</p>
        <h1 className="mt-2 text-2xl font-semibold">Security Monitoring</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs text-white/40">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#11151c] overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4 text-sm font-medium">Recent events</div>
        {loading ? (
          <div className="p-6 text-sm text-white/45">Loading security events…</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/45">No security events recorded.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {events.map((event) => (
              <div key={event.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.3fr_.5fr_.7fr_auto] md:items-center">
                <div>
                  <div className="flex items-center gap-2 text-sm"><AlertTriangle size={15} /> {event.type}</div>
                  <div className="mt-1 text-xs text-white/40">{event.description}</div>
                </div>
                <span className="text-xs text-white/60">{event.severity}</span>
                <span className="text-xs text-white/40">{new Date(event.createdAt).toLocaleString()}</span>
                {event.status === 'OPEN' ? (
                  <button onClick={async () => { await nodeApi.resolveSecurityEvent(event.id); await load(); }} className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/5">Resolve</button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 size={14} /> Resolved</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
