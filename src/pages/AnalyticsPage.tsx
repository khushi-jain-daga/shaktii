import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { nodeApi, type AnalyticsOverview } from '../services/nodeApi';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    nodeApi.analyticsOverview()
      .then((value) => { setData(value); setError(''); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/45">Loading analytics…</div>;
  if (error || !data) return <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-300">{error || 'Analytics unavailable'}</div>;

  const stats = [
    ['Protected files', data.summary.files],
    ['Verified files', data.summary.verifiedFiles],
    ['Tampered files', data.summary.tamperedFiles],
    ['Blockchain records', data.summary.blockchainRecords],
    ['Audit events', data.summary.audits],
    ['Security events', data.summary.securityEvents],
  ] as const;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-400">Operational intelligence</p>
        <h1 className="mt-2 text-2xl font-semibold">Analytics</h1>
        <p className="mt-2 text-sm text-white/55">Live metrics aggregated from the Node.js API and PostgreSQL data.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs text-white/40">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#11151c] p-5">
        <div className="mb-5">
          <div className="text-sm font-medium">Activity trend</div>
          <div className="mt-1 text-xs text-white/40">Recent audit activity grouped by day</div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeline}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,.1)' }} />
              <Area type="monotone" dataKey="activity" stroke="currentColor" fill="currentColor" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
