import { useEffect, useMemo, useState } from 'react';
import { Activity, Network, FileSearch, ShieldCheck } from 'lucide-react';

interface Props { onBack: () => void; onOpenPkap?: () => void; }

type Tab = 'telemetry'|'network'|'logs'|'policies';

const events = [
  ['14:32:05','AUTH_FAILURE','185.220.101.45','HIGH'],
  ['14:31:48','WAF_BLOCK','45.83.64.12','MEDIUM'],
  ['14:30:11','PORT_SCAN','10.14.22.7','LOW'],
  ['14:29:54','PRIV_ESC','srv-api-02','CRITICAL'],
  ['14:28:16','TOKEN_REVOKED','svc-worker','INFO'],
];

export default function Dashboard({ onBack, onOpenPkap }: Props) {
  const [tab,setTab]=useState<Tab>('telemetry');
  const [time,setTime]=useState('');
  useEffect(()=>{const tick=()=>setTime(new Date().toISOString().replace('T',' ').slice(0,19)+' UTC');tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[]);
  const tabs = useMemo(()=>[
    ['telemetry','01 // TELEMETRY & LIVE GRAPHS',Activity],
    ['network','02 // NETWORK TOPOLOGY GRAPH',Network],
    ['logs','03 // EVENT LOGS & FORENSICS',FileSearch],
    ['policies','04 // DEFENSE POLICIES & MITRE',ShieldCheck],
  ] as const,[]);
  return <div className="min-h-screen w-full bg-[#0a0b0d] bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:100px_100px] text-white font-mono overflow-x-hidden">
    <header className="h-[78px] max-w-[1520px] mx-auto px-6 sm:px-12 flex items-center justify-between border-b border-white/[0.06]"><div className="flex items-center gap-3"><div className="w-7 h-7 rounded-[6px] bg-white"/><span className="font-sans font-semibold text-[1.3rem]">SHAKTII</span></div><div className="flex items-center gap-3"><span className="hidden lg:block text-[10px] text-[#666d79]">{time}</span><button onClick={onOpenPkap} className="px-3 py-2 rounded border border-[#6e557d]/50 bg-[#6e557d]/15 text-[#cbb6d7] text-[10px] cursor-pointer">PKAP ANALYZER</button><button onClick={onBack} className="px-3 py-2 rounded border border-white/15 bg-white/[0.05] text-[10px] cursor-pointer">← RETURN TO SITE</button></div></header>
    <main className="max-w-[1520px] mx-auto px-6 sm:px-12 py-8">
      <div className="flex gap-2 overflow-x-auto pb-4 border-b border-white/[0.08]">{tabs.map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} className={`min-w-max px-3.5 py-2 rounded-[4px] border text-[10.5px] flex items-center gap-2 cursor-pointer ${tab===id?'bg-white text-black border-white':'bg-[#17191e]/40 border-white/10 text-[#8c93a2]'}`}><Icon size={14}/>{label}</button>)}</div>
      {tab==='telemetry'&&<section className="py-8 grid grid-cols-1 xl:grid-cols-3 gap-5"><div className="xl:col-span-2 border border-white/[0.08] bg-[#121419]/70 rounded-[8px] p-6"><div className="text-[11px] text-[#8c93a2] mb-6">LIVE TELEMETRY // LAST 60 MINUTES</div><div className="h-[260px] flex items-end gap-2">{[24,42,31,59,46,71,52,84,61,78,67,92,76,88,73,95,82,91,86,97].map((v,i)=><div key={i} className="flex-1 bg-[#6e557d]/70 border-t border-[#cbb6d7]/50 rounded-t-sm" style={{height:`${v}%`}}/>)}</div></div><div className="space-y-4">{[['PACKETS / SEC','18.4M'],['ACTIVE FLOWS','42,918'],['BLOCKED EVENTS','1,284'],['MEAN RESPONSE','0.72s']].map(([k,v])=><div key={k} className="border border-white/[0.08] bg-[#17191e]/60 rounded-[7px] p-5"><div className="text-[10px] text-[#666d79]">{k}</div><div className="text-3xl font-bold mt-2">{v}</div></div>)}</div></section>}
      {tab==='network'&&<section className="py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5"><div className="border border-white/[0.08] bg-[#121419]/70 rounded-[8px] min-h-[500px] relative overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,85,125,.12),transparent_55%)]"/><svg viewBox="0 0 900 500" className="w-full h-[500px]"><g stroke="#4f4258" strokeWidth="2" opacity=".7"><line x1="450" y1="250" x2="180" y2="130"/><line x1="450" y1="250" x2="720" y2="140"/><line x1="450" y1="250" x2="190" y2="380"/><line x1="450" y1="250" x2="710" y2="375"/></g>{[[450,250,34],[180,130,22],[720,140,22],[190,380,22],[710,375,22]].map(([x,y,r],i)=><g key={i}><circle cx={x} cy={y} r={r} fill={i===0?'#6e557d':'#17191e'} stroke="#cbb6d7" strokeWidth="2"/><text x={x} y={y+4} textAnchor="middle" fill="white" fontSize="12">{i===0?'CORE':`NODE ${i}`}</text></g>)}</svg></div><div className="space-y-3">{['EDGE-GW-01','API-CLUSTER','DB-PRIMARY','WORKER-MESH'].map((n,i)=><div key={n} className="p-4 rounded border border-white/[0.08] bg-[#17191e]/60"><div className="flex justify-between"><span className="text-[11px]">{n}</span><span className="text-[10px] text-emerald-300">HEALTHY</span></div><div className="text-[10px] text-[#666d79] mt-2">Trust score {98-i*3}%</div></div>)}</div></section>}
      {tab==='logs'&&<section className="py-8"><div className="border border-white/[0.08] bg-[#121419]/70 rounded-[8px] overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="text-[10px] text-[#666d79] border-b border-white/[0.08]"><tr>{['TIME','EVENT','SOURCE','SEVERITY'].map(h=><th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody>{events.map(r=><tr key={r[0]} className="border-b border-white/[0.05] text-[11px]"><td className="px-5 py-4 text-[#7b8290]">{r[0]}</td><td className="px-5 py-4">{r[1]}</td><td className="px-5 py-4 text-[#a9afba]">{r[2]}</td><td className="px-5 py-4">{r[3]}</td></tr>)}</tbody></table></div></section>}
      {tab==='policies'&&<section className="py-8 grid grid-cols-1 md:grid-cols-2 gap-5">{[['CREDENTIAL ACCESS','T1110 / Brute Force','AUTO-BLOCK'],['LATERAL MOVEMENT','T1021 / Remote Services','ISOLATE NODE'],['COMMAND & CONTROL','T1071 / Web Protocols','DROP FLOW'],['EXFILTRATION','T1041 / C2 Channel','REVOKE TOKEN']].map(([title,mitre,action])=><div key={title} className="p-6 rounded-[8px] border border-white/[0.08] bg-[#17191e]/60"><div className="text-[10px] text-[#8c93a2]">{mitre}</div><h3 className="font-bold mt-2 mb-4">{title}</h3><div className="flex justify-between text-[10px]"><span className="text-emerald-300">ENABLED</span><span className="text-[#cbb6d7]">{action}</span></div></div>)}</section>}
    </main>
  </div>
}
