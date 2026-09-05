import { useEffect, useState } from 'react';
import { Link2, ShieldCheck } from 'lucide-react';
import { nodeApi, type BlockchainRecord } from '../services/nodeApi';

export default function BlockchainPage() {
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setRecords(await nodeApi.blockchainRecords());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load blockchain records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-400">Immutable verification</p>
        <h1 className="mt-2 text-2xl font-semibold">Blockchain Ledger</h1>
        <p className="mt-2 text-sm text-white/55">Hash registrations and integrity checks for secured files.</p>
      </div>

      {loading && <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/50">Loading ledger…</div>}
      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-300">{error}</div>}
      {!loading && !error && records.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <Link2 className="mx-auto text-white/30" />
          <p className="mt-3 text-sm text-white/60">No blockchain records yet.</p>
          <p className="mt-1 text-xs text-white/35">Register a secured file from the Files page.</p>
        </div>
      )}

      <div className="grid gap-4">
        {records.map((record) => (
          <article key={record.id} className="rounded-xl border border-white/10 bg-[#11151c] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">{record.file?.originalName || 'Protected file'}</div>
                <div className="mt-2 break-all font-mono text-xs text-white/40">{record.transactionId}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${record.verified ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                {record.verified ? 'VERIFIED' : 'MISMATCH'}
              </span>
            </div>
            <div className="mt-4 grid gap-3 text-xs text-white/50 md:grid-cols-3">
              <div><span className="text-white/30">Network</span><div className="mt-1 text-white/70">{record.network}</div></div>
              <div><span className="text-white/30">File hash</span><div className="mt-1 truncate font-mono text-white/70">{record.fileHash}</div></div>
              <div><span className="text-white/30">Created</span><div className="mt-1 text-white/70">{new Date(record.createdAt).toLocaleString()}</div></div>
            </div>
            <button onClick={async () => { await nodeApi.verifyBlockchain(record.id); await load(); }} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
              <ShieldCheck size={14} /> Verify record
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
