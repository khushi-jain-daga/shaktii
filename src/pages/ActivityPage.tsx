import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { nodeApi, type AuditLog } from '../services/nodeApi';

export default function ActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nodeApi.auditLogs().then(setLogs).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return logs.filter((log) => `${log.action} ${log.resource || ''} ${log.status}`.toLowerCase().includes(q));
  }, [logs, query]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-400">Forensic trail</p>
        <h1 className="mt-2 text-2xl font-semibold">Activity & Audit Logs</h1>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <Search size={16} className="text-white/35" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search action, resource or status" className="w-full bg-transparent text-sm outline-none placeholder:text-white/25" />
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#11151c]">
        {loading ? (
          <div className="p-6 text-sm text-white/45">Loading audit logs…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/45">No matching audit events.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/35">
                <tr><th className="px-5 py-3">Action</th><th className="px-5 py-3">Resource</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Time</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-4 font-medium">{log.action}</td>
                    <td className="px-5 py-4 font-mono text-xs text-white/45">{log.resource || '—'}</td>
                    <td className="px-5 py-4"><span className={log.status === 'SUCCESS' ? 'text-emerald-300' : 'text-amber-300'}>{log.status}</span></td>
                    <td className="px-5 py-4 text-xs text-white/45">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
