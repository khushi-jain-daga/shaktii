import { useMemo, useState } from 'react';
import { AlertTriangle, Ban, BarChart3, Bot, CheckCircle2, Clipboard, Copy, Download, ExternalLink, FileText, Loader2, Mail, MessageCircle, RefreshCw, Search, Shield, ShieldAlert } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { buildMarkdownReport, type Finding, type IOC, type Severity } from '../../utils/pkapAnalyzer';
import type { StoredPkapAnalysis } from './PkapAnalyzerShell';

interface Props { data: StoredPkapAnalysis; onReset: () => void; }

type Investigation = { title: string; markdown: string } | null;

const sevOrder: Severity[] = ['Critical','High','Medium','Low','Info'];
const sevColor: Record<Severity,string> = { Critical:'#ef4444', High:'#f97316', Medium:'#f59e0b', Low:'#3b82f6', Info:'#71717a' };

function download(name: string, text: string) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function severityClass(sev: Severity) {
  return sev==='Critical'?'text-red-300 bg-red-500/10 border-red-400/25':sev==='High'?'text-orange-200 bg-orange-500/10 border-orange-400/25':sev==='Medium'?'text-yellow-200 bg-yellow-500/10 border-yellow-300/20':sev==='Low'?'text-blue-200 bg-blue-500/10 border-blue-300/20':'text-[#a2a8b1] bg-white/[0.03] border-white/10';
}

export default function ReportDashboard({ data, onReset }: Props) {
  const [query,setQuery]=useState('');
  const [severity,setSeverity]=useState<'All'|Severity>('All');
  const [investigation,setInvestigation]=useState<Investigation>(null);
  const [investigating,setInvestigating]=useState(false);
  const [reportBusy,setReportBusy]=useState(false);
  const [blocking,setBlocking]=useState<string | null>(null);
  const [notice,setNotice]=useState<string | null>(null);

  const severityData = useMemo(()=>sevOrder.map((name)=>({ name, value: data.severityBreakdown[name.toLowerCase() as keyof typeof data.severityBreakdown] || 0 })).filter((x)=>x.value>0),[data]);
  const eventData = useMemo(()=>{
    const counts = new Map<string,number>();
    data.findings.forEach((f)=>counts.set(f.eventType,(counts.get(f.eventType)||0)+1));
    return Array.from(counts.entries()).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count).slice(0,8);
  },[data]);
  const timeline = useMemo(()=>data.findings.slice(0,30).map((f,i)=>({ index:i+1, score:f.severity==='Critical'?5:f.severity==='High'?4:f.severity==='Medium'?3:f.severity==='Low'?2:1 })),[data]);
  const filtered = useMemo(()=>data.findings.filter((f)=>{
    const matchesSeverity=severity==='All'||f.severity===severity;
    const hay=`${f.eventType} ${f.sourceIP} ${f.description} ${f.mitreTag||''}`.toLowerCase();
    return matchesSeverity && hay.includes(query.toLowerCase());
  }),[data,query,severity]);
  const markdown = useMemo(()=>buildMarkdownReport(data.fileName,data,data.redactionLog),[data]);

  const investigate = async (finding: Finding) => {
    setInvestigating(true); setInvestigation(null);
    const fallback=`### Threat Context\n${finding.description}\n\n### Potential Impact\nThis ${finding.severity.toLowerCase()} event should be correlated with authentication, endpoint and network telemetry before declaring compromise.\n\n### Immediate Remediation\n1. Validate the source and affected asset.\n2. Review adjacent successful events and privileged activity.\n3. Contain only confirmed malicious indicators.`;
    try {
      const r=await fetch('/api/pkap-investigate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({finding})});
      const p=await r.json();
      setInvestigation({title:finding.eventType,markdown:p?.markdown||fallback});
    } catch { setInvestigation({title:finding.eventType,markdown:fallback}); }
    finally { setInvestigating(false); }
  };

  const generateReport = async () => {
    setReportBusy(true); let result=markdown;
    try {
      const r=await fetch('/api/pkap-generate-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({analysisData:data})});
      if(r.ok){const p=await r.json(); if(p?.report) result=p.report;}
    } catch { /* local report already ready */ }
    finally { setReportBusy(false); }
    const w=window.open('','_blank');
    if(w){w.document.write(`<title>PKAP Incident Report</title><style>body{font-family:ui-monospace,monospace;max-width:980px;margin:40px auto;padding:0 24px;white-space:pre-wrap;line-height:1.55;color:#18181b} </style><body>${result.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</body>`);w.document.close();}
  };

  const copySummary = async () => {
    const text=`SHAKTII / PKAP Analyzer — ${data.fileName}\nRisk: ${data.metadata.overallRiskScore}/100\nCritical: ${data.severityBreakdown.critical} | High: ${data.severityBreakdown.high} | Medium: ${data.severityBreakdown.medium}\n${data.executiveSummary}`;
    await navigator.clipboard.writeText(text); setNotice('Incident summary copied to clipboard.'); setTimeout(()=>setNotice(null),2200);
  };

  const contain = async (ioc: IOC) => {
    if(ioc.type!=='IP') return;
    setBlocking(ioc.value);
    try { await fetch('/api/pkap-block-ip',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ipAddress:ioc.value})}); setNotice(`Containment request recorded for ${ioc.value}.`); }
    catch { setNotice('Containment endpoint unavailable locally.'); }
    finally { setBlocking(null); setTimeout(()=>setNotice(null),2200); }
  };

  const risk=data.metadata.overallRiskScore;
  const riskLabel=risk>=75?'CRITICAL':risk>=50?'HIGH':risk>=25?'MEDIUM':'LOW';

  return <div className="space-y-5 min-w-0">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0"><div className="text-[10px] tracking-[0.16em] text-[#8d6b9d] mb-2">INCIDENT REPORT // {data.providerUsed||'LOCAL ENGINE'}</div><h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.035em] break-all">{data.fileName}</h1><div className="text-[11px] text-[#626b77] mt-2">{data.metadata.logTypeDetected} • {data.metadata.timeRangeCovered}</div></div>
      <div className="flex flex-wrap gap-2">
        <button onClick={()=>void generateReport()} className="btn btn-outline">{reportBusy?<Loader2 size={14} className="animate-spin"/>:<Bot size={14}/>} AI REPORT</button>
        <button onClick={()=>download(`PKAP-${data.fileName.replace(/[^a-z0-9._-]/gi,'_')}.md`,markdown)} className="btn btn-outline"><Download size={14}/> DOWNLOAD</button>
        <button onClick={onReset} className="btn btn-primary"><RefreshCw size={14}/> NEW ANALYSIS</button>
      </div>
    </div>

    {notice&&<div className="rounded-[6px] border border-emerald-400/20 bg-emerald-500/[0.05] px-4 py-3 text-[11px] text-emerald-200 flex items-center gap-2"><CheckCircle2 size={14}/>{notice}</div>}

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="panel p-5 col-span-2 md:col-span-1"><div className="text-[9px] tracking-[0.13em] text-[#646c77]">OVERALL RISK</div><div className="flex items-end gap-2 mt-2"><span className="font-sans text-4xl font-semibold">{risk}</span><span className="text-[11px] text-[#646c77] mb-1">/100</span></div><div className={`text-[10px] font-bold mt-3 ${risk>=75?'text-red-300':risk>=50?'text-orange-200':risk>=25?'text-yellow-200':'text-emerald-200'}`}>{riskLabel} RISK</div></div>
      <div className="panel p-5"><div className="text-[9px] tracking-[0.13em] text-[#646c77]">FINDINGS</div><div className="font-sans text-3xl font-semibold mt-2">{data.findings.length}</div><div className="text-[10px] text-[#646c77] mt-3">correlated anomalies</div></div>
      <div className="panel p-5"><div className="text-[9px] tracking-[0.13em] text-[#646c77]">IOCS</div><div className="font-sans text-3xl font-semibold mt-2">{data.iocs.length}</div><div className="text-[10px] text-[#646c77] mt-3">extracted indicators</div></div>
      <div className="panel p-5"><div className="text-[9px] tracking-[0.13em] text-[#646c77]">PRIVACY</div><div className="font-sans text-3xl font-semibold mt-2">{data.redactionLog.total}</div><div className="text-[10px] text-[#646c77] mt-3">values masked</div></div>
    </div>

    <div className="panel overflow-hidden"><div className="panel-header"><h2 className="panel-title flex items-center gap-2"><Shield size={16}/> Executive Summary</h2></div><div className="panel-body"><p className="text-[13px] sm:text-[14px] leading-7 text-[#b8bec8]">{data.executiveSummary}</p></div></div>

    <div className="grid lg:grid-cols-2 gap-5 min-w-0">
      <div className="panel overflow-hidden min-w-0"><div className="panel-header"><h2 className="panel-title flex items-center gap-2"><BarChart3 size={16}/> Severity Distribution</h2></div><div className="panel-body"><div className="h-[250px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={severityData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={2}>{severityData.map((d)=><Cell key={d.name} fill={sevColor[d.name as Severity]}/>)}</Pie><Tooltip contentStyle={{background:'#111318',border:'1px solid rgba(255,255,255,.1)',borderRadius:5}}/></PieChart></ResponsiveContainer></div><div className="flex flex-wrap gap-2 justify-center">{severityData.map((d)=><span key={d.name} className="text-[10px] text-[#858c98]"><i className="inline-block w-2 h-2 rounded-full mr-1" style={{background:sevColor[d.name as Severity]}}/>{d.name} {d.value}</span>)}</div></div></div>
      <div className="panel overflow-hidden min-w-0"><div className="panel-header"><h2 className="panel-title flex items-center gap-2"><BarChart3 size={16}/> Event Types</h2></div><div className="panel-body"><div className="h-[250px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={eventData} margin={{top:10,right:10,left:-24,bottom:44}}><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false}/><XAxis dataKey="name" stroke="#626b77" fontSize={9} angle={-28} textAnchor="end" interval={0}/><YAxis stroke="#626b77" fontSize={9}/><Tooltip contentStyle={{background:'#111318',border:'1px solid rgba(255,255,255,.1)',borderRadius:5}}/><Bar dataKey="count" fill="#6e557d" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div></div></div>
    </div>

    <div className="panel overflow-hidden min-w-0"><div className="panel-header"><h2 className="panel-title flex items-center gap-2"><BarChart3 size={16}/> Finding Severity Timeline</h2></div><div className="panel-body"><div className="h-[300px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={timeline} margin={{top:10,right:16,left:-24,bottom:0}}><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false}/><XAxis dataKey="index" stroke="#626b77" fontSize={10}/><YAxis domain={[0,5]} stroke="#626b77" fontSize={10}/><Tooltip contentStyle={{background:'#111318',border:'1px solid rgba(255,255,255,.1)',borderRadius:5}}/><Line type="monotone" dataKey="score" stroke="#a98abb" strokeWidth={2} dot={{r:3,fill:'#6e557d'}}/></LineChart></ResponsiveContainer></div></div></div>

    <div className="panel overflow-hidden min-w-0">
      <div className="panel-header flex flex-wrap gap-3 items-center justify-between"><h2 className="panel-title flex items-center gap-2"><ShieldAlert size={16}/> Security Findings</h2><div className="flex flex-wrap gap-2"><div className="flex items-center gap-2 border border-white/10 rounded-[4px] px-2 bg-black/20"><Search size={12} className="text-[#626b77]"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Filter findings" className="bg-transparent outline-none py-1.5 text-[10px] w-32"/></div><select value={severity} onChange={(e)=>setSeverity(e.target.value as any)} className="bg-[#121419] border border-white/10 rounded-[4px] px-2 text-[10px] outline-none">{['All',...sevOrder].map(s=><option key={s}>{s}</option>)}</select></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left"><thead><tr className="border-b border-white/[0.06] text-[9px] tracking-[0.1em] text-[#606874]">{['SEVERITY','EVENT','SOURCE','TIME','MITRE','DESCRIPTION','ACTION'].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{filtered.map((f,i)=><tr key={`${f.eventType}-${i}`} className="border-b border-white/[0.05] align-top"><td className="px-4 py-3"><span className={`inline-block border rounded px-2 py-1 text-[9px] ${severityClass(f.severity)}`}>{f.severity}</span></td><td className="px-4 py-3 text-[11px] text-white">{f.eventType}</td><td className="px-4 py-3 text-[10px] text-[#9ca3ad] break-all">{f.sourceIP}</td><td className="px-4 py-3 text-[10px] text-[#737b87]">{f.timestamp}</td><td className="px-4 py-3 text-[10px] text-[#b89ac6]">{f.mitreTag||'-'}</td><td className="px-4 py-3 text-[10px] leading-5 text-[#8b929e] max-w-[340px]">{f.description}</td><td className="px-4 py-3"><button onClick={()=>void investigate(f)} className="text-[9px] text-[#b89ac6] hover:text-white cursor-pointer">INVESTIGATE</button></td></tr>)}</tbody></table></div>
      {filtered.length===0&&<div className="p-8 text-center text-[11px] text-[#646c77]">No findings match the current filter.</div>}
    </div>

    {investigating&&<div className="panel p-5 flex items-center gap-3 text-[12px] text-[#8c94a0]"><Loader2 size={16} className="animate-spin text-[#a98abb]"/> Running focused investigation…</div>}
    {investigation&&<div className="panel overflow-hidden"><div className="panel-header flex justify-between"><h2 className="panel-title flex items-center gap-2"><Bot size={16}/> Investigation — {investigation.title}</h2><button onClick={()=>setInvestigation(null)} className="text-[10px] text-[#68717d] cursor-pointer">CLOSE</button></div><div className="panel-body whitespace-pre-wrap text-[12px] leading-7 text-[#aeb5bf]">{investigation.markdown}</div></div>}

    <div className="panel overflow-hidden min-w-0"><div className="panel-header"><h2 className="panel-title flex items-center gap-2"><AlertTriangle size={16}/> Indicators of Compromise</h2></div><div className="panel-body space-y-2">{data.iocs.length?data.iocs.map((ioc,i)=><div key={`${ioc.value}-${i}`} className="grid sm:grid-cols-[70px_minmax(0,1fr)_110px_auto] gap-3 items-center rounded-[5px] border border-white/[0.07] bg-white/[0.02] px-3 py-3 min-w-0"><span className="text-[9px] text-center border border-white/10 rounded px-2 py-1">{ioc.type}</span><span className="text-[11px] break-all">{ioc.value}</span><span className={`text-[9px] ${ioc.reputation==='Malicious'?'text-red-300':ioc.reputation==='Suspicious'?'text-orange-200':'text-[#7f8792]'}`}>{ioc.reputation}</span><div className="flex gap-2 justify-end"><button onClick={()=>{navigator.clipboard.writeText(ioc.value);setNotice('IOC copied.');setTimeout(()=>setNotice(null),1500)}} className="text-[#7e8794] hover:text-white cursor-pointer"><Copy size={13}/></button>{ioc.type==='IP'&&<button disabled={blocking===ioc.value} onClick={()=>void contain(ioc)} className="text-red-300/70 hover:text-red-200 cursor-pointer disabled:opacity-40">{blocking===ioc.value?<Loader2 size={13} className="animate-spin"/>:<Ban size={13}/>}</button>}</div></div>):<div className="text-[11px] text-[#646c77]">No specific indicators extracted.</div>}</div></div>

    <div className="grid lg:grid-cols-2 gap-5"><div className="panel overflow-hidden"><div className="panel-header"><h2 className="panel-title flex items-center gap-2"><CheckCircle2 size={16}/> Remediation Queue</h2></div><div className="panel-body"><ol className="space-y-3">{data.remediationChecklist.map((r,i)=><li key={r} className="flex gap-3 text-[12px] leading-6 text-[#9da4af]"><span className="w-6 h-6 rounded-full border border-[#6e557d]/40 bg-[#6e557d]/10 text-[#c8add5] flex items-center justify-center text-[9px] shrink-0">{i+1}</span><span>{r}</span></li>)}</ol></div></div><div className="panel overflow-hidden"><div className="panel-header"><h2 className="panel-title flex items-center gap-2"><Clipboard size={16}/> Share / Export</h2></div><div className="panel-body grid sm:grid-cols-2 gap-2"><button onClick={()=>void copySummary()} className="btn btn-outline"><Copy size={14}/> COPY SUMMARY</button><button onClick={()=>download(`PKAP-${data.fileName}.md`,markdown)} className="btn btn-outline"><FileText size={14}/> MARKDOWN</button><a className="btn btn-outline" href={`mailto:?subject=${encodeURIComponent(`PKAP Security Report — ${data.fileName}`)}&body=${encodeURIComponent(markdown.slice(0,7000))}`}><Mail size={14}/> EMAIL</a><a className="btn btn-outline" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`PKAP Analyzer: ${data.fileName}\nRisk ${risk}/100\n${data.executiveSummary}`)}`}><MessageCircle size={14}/> WHATSAPP</a><button onClick={()=>void generateReport()} className="btn btn-primary sm:col-span-2">{reportBusy?<Loader2 size={14} className="animate-spin"/>:<ExternalLink size={14}/>} OPEN FULL INCIDENT REPORT</button></div></div></div>
  </div>;
}
