import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { nodeApi, type DashboardSummary } from '../services/nodeApi';

const cards = [
  ['Protected files', 'protectedFiles', '/files'],
  ['Verified files', 'verifiedFiles', '/files'],
  ['Failed checks', 'failedVerifications', '/activity'],
  ['Security alerts', 'securityAlerts', '/security'],
  ['Critical alerts', 'criticalAlerts', '/security'],
  ['Blockchain records', 'blockchainRecords', '/blockchain'],
  ['Active users', 'activeUsers', '/activity'],
] as const;

export default function DashboardOverviewPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { nodeApi.dashboard().then(setData).catch((e) => setError(e instanceof Error ? e.message : 'Unable to load dashboard')); }, []);

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-emerald-400">Operations overview</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Security Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Live summary from the Node.js API and PostgreSQL. Open any module to drill into the complete workflow.</p>
        </div>
        <Link to="/upload" className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black">Secure a file</Link>
      </div>

      {error && <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}
      {!data ? <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-sm text-white/50">Loading dashboard…</div> : <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, key, to]) => (
            <Link key={key} to={to} className="rounded-xl border border-white/10 bg-[#10151c] p-5 transition hover:border-white/20 hover:bg-[#131922]">
              <div className="text-sm text-white/45">{label}</div>
              <div className="mt-3 text-3xl font-semibold">{data[key]}</div>
              <div className="mt-4 text-xs text-emerald-300">View details →</div>
            </Link>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
          <section className="rounded-xl border border-white/10 bg-[#10151c] p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Recent activity</h2><Link to="/activity" className="text-xs text-emerald-300">View all →</Link></div>
            <div className="mt-4 divide-y divide-white/10">
              {data.recentActivity.length === 0 ? <div className="py-8 text-sm text-white/40">No activity yet.</div> : data.recentActivity.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div><div>{row.action.replaceAll('_', ' ')}</div><div className="mt-1 text-xs text-white/35">{row.resource || 'System'} · {new Date(row.createdAt).toLocaleString()}</div></div>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60">{row.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#10151c] p-5">
            <h2 className="font-semibold">Demo workflow</h2>
            <div className="mt-4 space-y-3 text-sm text-white/55">
              {['1. Upload file','2. Generate SHA-256','3. Encrypt with AES-256-GCM','4. Verify integrity','5. Register blockchain record','6. Review analytics & audit log'].map((step) => <div key={step} className="rounded-lg border border-white/10 px-3 py-2.5">{step}</div>)}
            </div>
          </section>
        </div>
      </>}
    </div>
  );
}
