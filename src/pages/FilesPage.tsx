import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { nodeApi, type SecureFile } from '../services/nodeApi';

export default function FilesPage() {
  const [files, setFiles] = useState<SecureFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try { setFiles(await nodeApi.files()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load files'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function run(id: string, action: 'encrypt' | 'verify' | 'blockchain') {
    setBusyId(id);
    setError('');
    try {
      if (action === 'encrypt') await nodeApi.encrypt(id);
      else if (action === 'verify') await nodeApi.verify(id);
      else await nodeApi.registerBlockchain(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${action} file`);
    } finally { setBusyId(null); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-emerald-400">Protected Assets</div>
          <h1 className="mt-2 text-3xl font-semibold">Secure Files</h1>
          <p className="mt-2 text-sm text-white/50">Upload, encrypt, verify and register file fingerprints from the Node.js security service.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/blockchain" className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/70">Open ledger</Link>
          <Link to="/upload" className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black">Upload file</Link>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-sm text-white/50">Loading protected files…</div>
      ) : files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <div className="text-lg font-medium">No protected files yet</div>
          <p className="mt-2 text-sm text-white/50">Upload your first file to start the security workflow.</p>
          <Link to="/upload" className="mt-5 inline-block rounded-lg border border-white/10 px-4 py-2 text-sm">Upload first file</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-white/45">
              <tr><th className="px-4 py-3">File</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">SHA-256</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {files.map((file) => (
                <tr key={file.id} className="bg-[#0e1218]">
                  <td className="px-4 py-4"><div className="font-medium">{file.originalName}</div><div className="mt-1 text-xs text-white/35">{(file.size / 1024).toFixed(1)} KB · {file.mimeType}</div></td>
                  <td className="px-4 py-4"><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs">{file.status}</span></td>
                  <td className="max-w-xs truncate px-4 py-4 font-mono text-xs text-white/45">{file.sha256}</td>
                  <td className="px-4 py-4"><div className="flex flex-wrap gap-2">
                    <button disabled={busyId === file.id} onClick={() => void run(file.id, 'encrypt')} className="rounded-md border border-white/10 px-3 py-1.5 text-xs disabled:opacity-40">Encrypt</button>
                    <button disabled={busyId === file.id} onClick={() => void run(file.id, 'verify')} className="rounded-md border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40">Verify</button>
                    <button disabled={busyId === file.id} onClick={() => void run(file.id, 'blockchain')} className="rounded-md border border-cyan-400/30 px-3 py-1.5 text-xs text-cyan-300 disabled:opacity-40">Register hash</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
