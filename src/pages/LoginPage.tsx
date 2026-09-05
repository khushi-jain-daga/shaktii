import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/common/BrandLogo';
import { nodeApi } from '../services/nodeApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    try { await nodeApi.login(email, password); navigate('/dashboard'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in'); }
    finally { setLoading(false); }
  }

  return <div className="min-h-screen bg-[#090b0f] text-white grid place-items-center px-4 py-8">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11151c] p-7 shadow-2xl">
      <BrandLogo heightClassName="h-10" />
      <h1 className="mt-5 text-2xl font-semibold">Security Control Center</h1>
      <p className="mt-2 text-sm leading-6 text-white/50">Sign in to access protected files, verification, analytics and security operations.</p>
      <label className="mt-7 block text-sm text-white/70">Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 outline-none focus:border-emerald-400/60" />
      <label className="mt-4 block text-sm text-white/70">Password</label><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 outline-none focus:border-emerald-400/60" />
      {error && <div className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</div>}
      <button disabled={loading} className="mt-6 w-full rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-black disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
      <p className="mt-5 text-center text-sm text-white/45">Need an account? <Link to="/register" className="text-emerald-300">Create one</Link></p>
    </form>
  </div>;
}
