import { useEffect, useState } from 'react';
import { nodeApi, type ReportSummary } from '../services/nodeApi';

export default function ReportsPage() {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { nodeApi.reportSummary().then(setData).catch((e) => setError(e instanceof Error ? e.message : 'Unable to load reports')); }, []);

  async function downloadCsv() {
    try {
      const response = await fetch(nodeApi.reportCsvUrl(), { headers: nodeApi.authHeader() });
      if (!response.ok) throw new Error('Unable to export report');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'shaktii-audit-report.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to export report'); }
  }

  const cards = data ? [
    ['Protected files', data.files], ['Verified files', data.verified], ['Tampered files', data.tampered],
    ['Blockchain records', data.blockchain], ['Security events', data.security], ['Audit events', data.audits],
  ] : [];

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="text-xs uppercase tracking-[0.2em] text-emerald-400">Reporting</div><h1 className="mt-2 text-3xl font-semibold">Security Reports</h1><p className="mt-2 text-sm text-white/50">Operational summary and exportable audit history.</p></div>
      <button onClick={() => void downloadCsv()} className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black">Export audit CSV</button>
    </div>
    {error && <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}
    {!data ? <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-sm text-white/50">Loading report…</div> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-[#10151c] p-5"><div className="text-sm text-white/45">{label}</div><div className="mt-3 text-3xl font-semibold">{value}</div></div>)}</div>
      <div className="rounded-xl border border-white/10 bg-[#10151c] p-5 text-sm text-white/50">Generated: {new Date(data.generatedAt).toLocaleString()}</div>
    </>}
  </div>;
}
