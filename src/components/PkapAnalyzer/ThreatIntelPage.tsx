import { useState } from 'react';
import { Activity, AlertTriangle, ChevronRight, Crosshair, Database, Globe, Loader2, Search } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ThreatIntelResult {
  summary: string;
  threatActors?: string[];
  iocs?: Array<{ value: string; type: string; description?: string }>;
  mitigations?: string[];
  stats?: { malicious?: number; suspicious?: number; harmless?: number; undetected?: number };
  reputation?: number;
  owner?: string;
  country?: string;
  network?: string;
  provider?: string;
  categories?: string[];
}

const trendingThreats = [
  { name: 'APT29 (Cozy Bear)', type: 'State-Sponsored', target: 'Government, Tech', trend: 'Rising' },
  { name: 'LockBit 3.0', type: 'Ransomware', target: 'Enterprise, Healthcare', trend: 'Stable' },
  { name: 'Scattered Spider', type: 'Financially Motivated', target: 'Telecom, Identity', trend: 'High' },
  { name: 'Volt Typhoon', type: 'State-Sponsored', target: 'Critical Infrastructure', trend: 'Rising' },
];

const timelineData = [
  { time: 'Mon', events: 120 },
  { time: 'Tue', events: 150 },
  { time: 'Wed', events: 80 },
  { time: 'Thu', events: 210 },
  { time: 'Fri', events: 180 },
  { time: 'Sat', events: 90 },
  { time: 'Sun', events: 110 },
];

function inferType(query: string) {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(query)) return 'IP';
  if (/^[a-fA-F0-9]{32,64}$/.test(query)) return 'Hash';
  return 'Domain';
}

function localFallback(query: string): ThreatIntelResult {
  const type = inferType(query);
  const suspicious = type === 'Hash' ? 45 : type === 'IP' ? 12 : 0;
  return {
    provider: 'Local fallback / add VIRUSTOTAL_API_KEY for live enrichment',
    summary: `${suspicious} simulated security vendors flagged this ${type.toLowerCase()} as suspicious. This local fallback keeps the workflow usable while the real VirusTotal serverless endpoint is unavailable in plain Vite development mode.`,
    threatActors: suspicious > 0 ? ['Generic Threat Cluster', 'Suspicious Infrastructure'] : [],
    iocs: [{ value: query, type, description: `Local reputation estimate: ${suspicious > 0 ? 'Suspicious' : 'Unknown'}` }],
    mitigations: suspicious > 0
      ? [`Validate and, if confirmed, block ${query} at the appropriate enforcement point.`, `Investigate internal endpoints that communicated with this ${type.toLowerCase()}.`, 'Review DNS, proxy, endpoint, and authentication logs for correlated activity.']
      : ['No immediate blocking action based on local fallback data.', 'Continue monitoring and perform a live VirusTotal lookup after deployment.'],
    stats: { malicious: suspicious, suspicious: Math.max(0, Math.floor(suspicious / 4)), harmless: suspicious ? 8 : 45, undetected: 12 },
    reputation: suspicious ? -15 : 0,
  };
}

export default function ThreatIntelPage() {
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ThreatIntelResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/pkap-threat-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: normalized }),
      });
      if (!response.ok) throw new Error(`Threat-intel API returned ${response.status}`);
      const payload = await response.json() as { success?: boolean; analysis?: ThreatIntelResult; error?: string };
      if (!payload.success || !payload.analysis) throw new Error(payload.error || 'Threat-intel lookup failed');
      setResult(payload.analysis);
    } catch (err) {
      setResult(localFallback(normalized));
      setError(err instanceof Error ? err.message : 'Live threat intelligence unavailable; showing local fallback.');
    } finally {
      setBusy(false);
    }
  };

  const stats = result?.stats;

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 min-w-0">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-11 h-11 rounded-[6px] border border-[#6e557d]/40 bg-[#6e557d]/10 flex items-center justify-center shrink-0"><Database size={22} className="text-[#a98abb]"/></div>
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.16em] text-[#8d6b9d] mb-1">GLOBAL LANDSCAPE // IOC ENRICHMENT</div>
          <h1 className="font-sans text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">Threat Intelligence</h1>
          <p className="text-[12px] sm:text-[13px] text-[#747c89] mt-1">Targeted IP, domain and hash reputation, threat activity trends and global actor context in a bounded SOC workspace.</p>
        </div>
      </div>

      <form onSubmit={lookup} className="mb-8 min-w-0">
        <div className="panel p-1.5 flex items-center min-w-0 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
          <Search size={18} className="ml-3 mr-3 text-[#68717e] shrink-0"/>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search IPs, Domains, or Hashes..."
            className="min-w-0 flex-1 bg-transparent border-none outline-none text-white placeholder:text-[#545b66] px-0 py-3 text-[13px] sm:text-sm font-mono"
          />
          <button disabled={busy || !query.trim()} className="shrink-0 bg-[#6e557d] hover:bg-[#7c608c] disabled:opacity-50 disabled:cursor-not-allowed rounded-[6px] px-3 sm:px-5 py-3 text-[11px] sm:text-[12px] font-semibold cursor-pointer flex items-center gap-2">
            {busy ? <><Loader2 size={15} className="animate-spin"/><span className="hidden sm:inline">ANALYZING…</span></> : 'LOOKUP'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-5 rounded-[6px] border border-yellow-300/20 bg-yellow-400/[0.05] px-4 py-3 flex gap-3 text-[11px] sm:text-[12px] text-[#aeb4be]">
          <AlertTriangle size={16} className="text-yellow-300 shrink-0"/><span>{error}</span>
        </div>
      )}

      {result ? (
        <div className="panel overflow-hidden animate-fade-in min-w-0">
          <div className="panel-header flex flex-wrap items-center justify-between gap-3">
            <h2 className="panel-title flex items-center gap-2"><Crosshair size={17} className="text-[#a98abb]"/> Threat Report: {query.trim()}</h2>
            {result.provider && <span className="text-[9px] tracking-[0.1em] text-[#69717d] border border-white/10 px-2 py-1 rounded-[3px]">{result.provider}</span>}
          </div>
          <div className="panel-body flex flex-col gap-6 min-w-0">
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  ['MALICIOUS', stats.malicious || 0, 'text-red-300 border-red-400/20 bg-red-500/[0.06]'],
                  ['SUSPICIOUS', stats.suspicious || 0, 'text-orange-200 border-orange-400/20 bg-orange-500/[0.06]'],
                  ['HARMLESS', stats.harmless || 0, 'text-emerald-200 border-emerald-400/20 bg-emerald-500/[0.06]'],
                  ['UNDETECTED', stats.undetected || 0, 'text-[#a7adba] border-white/10 bg-white/[0.03]'],
                ].map(([label, value, classes]) => (
                  <div key={String(label)} className={`rounded-[5px] border p-3 ${classes}`}>
                    <div className="text-[9px] tracking-[0.12em] opacity-70">{label}</div>
                    <div className="font-sans text-2xl font-semibold mt-1">{value}</div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <h3 className="text-[10px] tracking-[0.13em] text-[#69717d] mb-2">EXECUTIVE SUMMARY</h3>
              <p className="text-[13px] sm:text-[14px] leading-7 text-[#c0c5ce]">{result.summary}</p>
            </div>

            {(result.owner || result.country || result.network || typeof result.reputation === 'number') && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[['REPUTATION', result.reputation ?? 'N/A'], ['OWNER / ASN', result.owner || 'N/A'], ['COUNTRY', result.country || 'N/A'], ['NETWORK', result.network || 'N/A']].map(([label, value]) => (
                  <div key={String(label)} className="rounded-[5px] border border-white/[0.07] bg-white/[0.02] p-3 min-w-0">
                    <div className="text-[9px] tracking-[0.12em] text-[#636b76]">{label}</div>
                    <div className="text-[12px] text-white mt-1 break-all">{String(value)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 min-w-0">
              {result.threatActors && result.threatActors.length > 0 && (
                <div className="min-w-0">
                  <h3 className="text-[10px] tracking-[0.13em] text-[#69717d] mb-3">ASSOCIATED ACTORS / CLASSIFICATIONS</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.threatActors.map((actor) => <span key={actor} className="text-[10px] border border-red-400/25 bg-red-500/[0.07] text-red-300 px-2.5 py-1.5 rounded-full break-all">{actor}</span>)}
                  </div>
                </div>
              )}
              {result.mitigations && result.mitigations.length > 0 && (
                <div className="min-w-0">
                  <h3 className="text-[10px] tracking-[0.13em] text-[#69717d] mb-3">RECOMMENDED MITIGATIONS</h3>
                  <ul className="space-y-2">
                    {result.mitigations.map((step) => <li key={step} className="flex gap-2 text-[12px] leading-5 text-[#b6bcc5]"><ChevronRight size={14} className="text-[#a98abb] mt-0.5 shrink-0"/><span>{step}</span></li>)}
                  </ul>
                </div>
              )}
            </div>

            {result.iocs && result.iocs.length > 0 && (
              <div className="min-w-0">
                <h3 className="text-[10px] tracking-[0.13em] text-[#69717d] mb-3">KNOWN IOCS</h3>
                <div className="space-y-2 min-w-0">
                  {result.iocs.map((ioc, index) => (
                    <div key={`${ioc.value}-${index}`} className="grid sm:grid-cols-[70px_minmax(140px,0.8fr)_1.3fr] gap-2 sm:gap-4 items-start rounded-[5px] border border-white/[0.07] bg-white/[0.02] px-3 py-3 min-w-0">
                      <span className="text-center text-[9px] tracking-[0.1em] border border-white/10 bg-[#17191e] text-[#89909b] px-2 py-1 rounded-[3px]">{ioc.type}</span>
                      <span className="text-[11px] text-white break-all">{ioc.value}</span>
                      <span className="text-[11px] text-[#707985] break-words">{ioc.description || 'No additional description.'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 min-w-0 items-stretch">
          <div className="panel min-w-0 overflow-hidden">
            <div className="panel-header"><h2 className="panel-title flex items-center gap-2"><Globe size={17}/> Global Threat Landscape</h2></div>
            <div className="panel-body min-w-0">
              <div className="h-[300px] w-full min-w-0 overflow-hidden" aria-label="Seven day threat activity chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData} margin={{ top: 10, right: 14, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false}/>
                    <XAxis dataKey="time" stroke="#69717d" fontSize={11} tickLine={false} axisLine={false}/>
                    <YAxis stroke="#69717d" fontSize={11} tickLine={false} axisLine={false}/>
                    <Tooltip contentStyle={{ backgroundColor: '#111318', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '5px', color: '#fff', fontSize: '11px' }} itemStyle={{ color: '#a98abb' }}/>
                    <Line type="monotone" dataKey="events" name="Detected Threats" stroke="#8d6b9d" strokeWidth={2} dot={{ fill: '#111318', stroke: '#b69ac4', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#8d6b9d' }}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="panel min-w-0 overflow-hidden">
            <div className="panel-header"><h2 className="panel-title flex items-center gap-2"><Activity size={17}/> Trending Threat Actors</h2></div>
            <div className="overflow-x-auto min-w-0">
              <table className="w-full min-w-[560px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.015]">
                    <th className="px-4 py-3 text-[9px] tracking-[0.12em] text-[#68717d]">ACTOR</th>
                    <th className="px-4 py-3 text-[9px] tracking-[0.12em] text-[#68717d]">TYPE / TARGET</th>
                    <th className="px-4 py-3 text-[9px] tracking-[0.12em] text-[#68717d]">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {trendingThreats.map((threat) => (
                    <tr key={threat.name} className="border-b border-white/[0.05] last:border-b-0">
                      <td className="px-4 py-4 text-[12px] font-semibold text-white">{threat.name}</td>
                      <td className="px-4 py-4"><div className="text-[11px] text-[#b2b7c0]">{threat.type}</div><div className="text-[10px] text-[#646c77] mt-1">Target: {threat.target}</div></td>
                      <td className="px-4 py-4"><span className={`px-2.5 py-1 rounded-full text-[9px] font-semibold border ${threat.trend === 'Rising' ? 'text-red-300 border-red-400/20 bg-red-500/[0.06]' : threat.trend === 'High' ? 'text-orange-200 border-orange-400/20 bg-orange-500/[0.06]' : 'text-[#c4aeda] border-[#8d6b9d]/25 bg-[#6e557d]/10'}`}>{threat.trend}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
