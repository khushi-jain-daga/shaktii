import { useState } from 'react';
import { BookOpen, Cpu, Database, Download, EyeOff, FileText, Shield, Terminal } from 'lucide-react';

type Tab = 'overview'|'formats'|'privacy'|'engine'|'exports'|'api'|'faq';

const nav: Array<[Tab,string,any]> = [
  ['overview','System Overview',Shield],['formats','Log Sources & Formats',Database],['privacy','PII Redaction & Privacy',EyeOff],['engine','AI & Heuristic Engine',Cpu],['exports','Exporting & Sharing',Download],['api','API Endpoints',Terminal],['faq','FAQ',BookOpen],
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="panel overflow-hidden"><div className="panel-header"><h3 className="panel-title">{title}</h3></div><div className="panel-body text-[12px] sm:text-[13px] leading-7 text-[#8b929e]">{children}</div></div>;
}

export default function DocsPage() {
  const [tab,setTab]=useState<Tab>('overview');
  return <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 min-w-0">
    <div className="mb-8"><div className="text-[10px] tracking-[0.16em] text-[#8d6b9d] mb-2">REFERENCE // PRODUCT DOCUMENTATION</div><h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.035em]">Pkap Analyzer Documentation</h1><p className="text-[12px] sm:text-[13px] text-[#747c89] mt-2">Architecture, ingestion, privacy, analysis, reporting, threat intelligence and deployment reference.</p></div>
    <div className="grid lg:grid-cols-[250px_minmax(0,1fr)] gap-7 min-w-0">
      <aside className="lg:sticky lg:top-[136px] self-start panel p-2 min-w-0">{nav.map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} className={`w-full text-left px-3 py-3 rounded-[5px] text-[11px] flex items-center gap-2 cursor-pointer ${tab===id?'bg-[#6e557d]/15 text-[#c9afd5]':'text-[#717986] hover:bg-white/[0.03] hover:text-white'}`}><Icon size={14}/>{label}</button>)}</aside>
      <main className="min-w-0 space-y-5">
        {tab==='overview'&&<>
          <Card title="SYSTEM OVERVIEW"><p>Pkap Analyzer is SHAKTII's privacy-first SOC workspace. It ingests raw logs, masks sensitive values, scores risk, correlates findings, extracts indicators, supports IOC enrichment, investigation, local history and exportable incident reports.</p></Card>
          <div className="grid md:grid-cols-3 gap-4">{[['ZERO TRUST','Sensitive values are redacted locally before optional external AI processing.'],['DUAL ENGINE','AI providers are attempted first when configured; a deterministic parser keeps analysis available without keys.'],['INCIDENT READY','Findings, severity, evidence, IOCs, remediation and formal reports stay in one workflow.']].map(([a,b])=><div key={a} className="panel p-5"><div className="text-[10px] tracking-[0.11em] text-[#a98abb] mb-3">{a}</div><p className="text-[12px] leading-6 text-[#727a86]">{b}</p></div>)}</div>
          <Card title="ANALYSIS WORKFLOW"><ol className="list-decimal pl-5 space-y-2"><li>Upload or paste `.log`, `.txt`, `.json`, or `.csv` data.</li><li>Run client-side privacy masking.</li><li>Correlate events with configured AI providers or the local parser.</li><li>Review risk score, severity, findings, MITRE tags and IOCs.</li><li>Investigate indicators using Threat Intel and vendor reputation data.</li><li>Export or share the incident report and keep a local report history.</li></ol></Card>
        </>}
        {tab==='formats'&&<>
          <Card title="SUPPORTED INPUTS"><p>Supported upload extensions: <code>.log</code>, <code>.txt</code>, <code>.json</code>, and <code>.csv</code>. The deterministic engine recognizes common syslog/authentication, web access, JSON event, CSV export, Windows security, kernel/runtime and generic application patterns.</p></Card>
          <Card title="EXAMPLES"><pre className="overflow-x-auto whitespace-pre-wrap text-[11px] bg-[#090a0c] border border-white/[0.06] rounded p-4 text-[#9ca3af]">{`2026-09-04T14:32:02Z ERROR sshd Failed password for admin from 185.220.101.45\n2026-09-04T14:32:05Z CRITICAL privilege escalation attempt user=svc-api\n{"level":"warn","event":"blocked outbound connection","domain":"example.xyz"}`}</pre></Card>
          <Card title="LARGE FILES"><p>Browser uploads are capped at 100 MB in the UI. The local parser samples very large event sets by combining the beginning and end of the dataset, limiting analysis to a bounded number of lines to protect UI responsiveness.</p></Card>
        </>}
        {tab==='privacy'&&<>
          <Card title="LOCAL REDACTION"><p>Before optional remote AI analysis, Pkap Analyzer masks IPv4 addresses, email addresses, payment-card-like numbers, SSN-like values, bearer tokens, passwords, API keys and generic secrets. A redaction summary is shown in the report.</p></Card>
          <Card title="WHAT LEAVES THE BROWSER"><p>When AI Assist is enabled and a server-side provider key exists, only the redacted log text is submitted to the `/api/pkap-analyze` function. Real API keys stay server-side. Without provider keys, analysis remains local.</p></Card>
          <Card title="RETENTION"><p>Reports are stored in browser local storage for convenience. Auto-delete can remove reports older than 90 days when new results are saved. Reset Local Data clears the browser-side PKAP history.</p></Card>
        </>}
        {tab==='engine'&&<>
          <Card title="AI PROVIDER ORDER"><p>The serverless analyzer attempts Gemini, Grok/Groq, Claude, then OpenAI when corresponding keys are configured. Provider failures do not break the workspace—the client already has a deterministic analysis result available.</p></Card>
          <Card title="DETERMINISTIC ENGINE"><p>The local engine detects severity keywords, authentication failures, access denials, network/service faults, command execution, malware-like terms and possible exfiltration. It maps major patterns to MITRE-style tags and extracts IP, domain, hash and user indicators.</p></Card>
          <Card title="RISK MODEL"><ul className="space-y-2"><li><b className="text-red-300">75–100:</b> critical/high-confidence security review.</li><li><b className="text-orange-200">50–74:</b> elevated threat activity requiring investigation.</li><li><b className="text-yellow-200">25–49:</b> suspicious or warning-level activity.</li><li><b className="text-blue-200">0–24:</b> baseline / low-risk activity.</li></ul></Card>
        </>}
        {tab==='exports'&&<>
          <Card title="REPORT EXPORT"><p>The Report page generates an incident-ready Markdown document including metadata, risk assessment, severity breakdown, findings, technical evidence, IOCs, remediation and conclusion. It can be previewed, copied, downloaded or shared through supported browser links.</p></Card>
          <Card title="HISTORY"><p>Reports History reopens previous analyses in the same bounded report dashboard. Individual records can be removed, and the full local archive can be cleared from the browser.</p></Card>
        </>}
        {tab==='api'&&<>
          <Card title="SERVERLESS ENDPOINTS"><div className="space-y-4">{[['POST /api/pkap-analyze','Redacted log analysis using configured AI providers.'],['POST /api/pkap-investigate','Focused Tier-3-style investigation of an individual finding.'],['POST /api/pkap-threat-intel','IP/domain/hash reputation lookup using VirusTotal when configured.'],['POST /api/pkap-generate-report','Optional AI-assisted incident report generation with local report fallback.'],['POST /api/pkap-block-ip','Safe demonstration containment endpoint; integrate real WAF/SOAR credentials server-side before production enforcement.']].map(([a,b])=><div key={a}><code className="text-[#c7afd2]">{a}</code><p className="mt-1 text-[#777f8b]">{b}</p></div>)}</div></Card>
          <Card title="VERCEL ENVIRONMENT VARIABLES"><pre className="text-[11px] overflow-x-auto bg-[#090a0c] border border-white/[0.06] rounded p-4 text-[#9ca3af]">GEMINI_API_KEY=\nGROK_API_KEY=\nANTHROPIC_API_KEY=\nOPENAI_API_KEY=\nVIRUSTOTAL_API_KEY=</pre></Card>
        </>}
        {tab==='faq'&&<>
          {[['Are raw logs always sent to AI?','No. Redaction happens locally first, and remote AI is optional. The local parser runs without external keys.'],['Why does Threat Intel show fallback data locally?','Plain `vite` development does not execute Vercel serverless functions. Deploy to Vercel or use an appropriate local serverless runtime for live VirusTotal calls.'],['Why is Report unavailable before analysis?','A report needs analysis data. Upload/paste logs and run analysis first; the result then opens automatically and is archived locally.'],['Can block-IP enforce a real firewall rule?','The provided endpoint is intentionally a safe demonstration. Connect it to authenticated WAF/SOAR infrastructure only in a controlled production environment.']].map(([q,a])=><Card key={q} title={q.toUpperCase()}><p>{a}</p></Card>)}
        </>}
      </main>
    </div>
  </section>;
}
