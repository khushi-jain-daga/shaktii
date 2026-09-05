import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { nodeApi } from '../services/nodeApi';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      await nodeApi.upload(file);
      navigate('/files');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-emerald-400">Protection Workflow</div>
        <h1 className="mt-2 text-3xl font-semibold">Upload & Secure File</h1>
        <p className="mt-2 text-sm leading-6 text-white/50">The Node.js backend stores the file with a safe generated name and immediately creates its SHA-256 integrity fingerprint.</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-[#10141b] p-6">
        <label className="block rounded-xl border border-dashed border-white/15 bg-black/20 p-10 text-center cursor-pointer hover:border-emerald-400/40">
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div className="text-base font-medium">{file ? file.name : 'Choose a file'}</div>
          <div className="mt-2 text-xs text-white/40">Maximum file size: 25 MB</div>
          {file && <div className="mt-3 text-xs text-white/50">{(file.size / 1024).toFixed(1)} KB · {file.type || 'application/octet-stream'}</div>}
        </label>

        {error && <div className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button disabled={!file || loading} className="rounded-lg bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-40">
            {loading ? 'Uploading & hashing…' : 'Upload & create fingerprint'}
          </button>
          <Link to="/files" className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/70">Cancel</Link>
        </div>
      </form>

      <div className="grid gap-3 md:grid-cols-3">
        {['1. Upload securely', '2. Encrypt with AES-256-GCM', '3. Verify SHA-256 integrity'].map((item) => (
          <div key={item} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/60">{item}</div>
        ))}
      </div>
    </div>
  );
}
