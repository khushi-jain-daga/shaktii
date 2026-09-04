import { motion } from 'framer-motion';
import PkapAnalyzerIntro from './PkapAnalyzer/PkapAnalyzerIntro';

interface Props {
  onOpenDashboard: () => void;
  onOpenPkap: () => void;
}

const metrics = [
  ['[ZERO-DAY]','99.99%','INTERCEPTION ACCURACY','Polymorphic payload neutralization'],
  ['[LATENCY]','< 0.8s','AUTONOMOUS REACTION','Hardware-accelerated edge mitigation'],
  ['[DEPLOYMENT]','140+','SOVEREIGN REGIONS','Low-latency sensor mesh coverage'],
  ['[CAPACITY]','40M+','TELEMETRY OPS / SEC','Continuous zero-trust validation'],
];

const capabilities = [
  ['AUTONOMOUS THREAT DETECTION','Neural pattern recognition continuously analyzes telemetry, behavior, system calls and network anomalies in real time.','REAL-TIME'],
  ['KERNEL-LEVEL OBSERVABILITY','Low-overhead telemetry exposes process, network and syscall behavior without relying on fragmented agent data.','eBPF'],
  ['AUTONOMOUS CONTAINMENT','Policy-driven response isolates risky workloads, blocks hostile indicators and shortens incident response windows.','SOAR'],
  ['THREAT INTELLIGENCE CORRELATION','Indicators, reputation data and analysis findings are correlated into a single investigation workflow.','INTEL'],
];

const solutions = [
  ['ENTERPRISE','FULL-STACK INFRASTRUCTURE SHIELD','Hybrid-cloud defense, SIEM/SOAR integration, identity-aware controls and compliance mapping.'],
  ['GOVERNMENT & DEFENSE','SOVEREIGN AIRGAP PROTOCOL','On-premise and isolated deployment models for sensitive environments and sovereign data controls.'],
  ['STARTUPS & SCALE-UPS','CLOUD-NATIVE RAPID SHIELD','Fast deployment, production-grade monitoring and security workflows that scale with infrastructure.'],
];

export default function LandingPage({ onOpenDashboard, onOpenPkap }: Props) {
  return (
    <>
      <main className="relative max-w-[1520px] w-full mx-auto px-6 sm:px-12 pt-10 pb-16 z-10 min-h-[720px] flex items-center">
        <div className="max-w-[980px]">
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.5}} className="inline-flex items-center gap-2 font-mono text-[13px] text-[#8a909d] mb-6">
            <span className="text-[10px] text-[#bdc3cf]">✦</span><span>Real-time threat monitoring</span>
          </motion.div>
          <motion.h1 initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.65,delay:.08}} className="font-mono text-[clamp(3rem,6vw,5.7rem)] font-bold leading-[1.04] tracking-[-0.025em] text-white uppercase mb-8">
            <span className="block">YOUR TRUSTED PARTNER</span>
            <span className="block">IN DIGITAL DEFENSE</span>
          </motion.h1>
          <motion.p initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.65,delay:.14}} className="font-mono text-[14.5px] leading-[1.7] text-[#757b88] mb-9 max-w-[620px]">
            Real-time AI-powered threat detection, packet and kernel visibility, autonomous response, and forensic analysis to protect modern infrastructure 24/7.
          </motion.p>
          <div className="flex flex-wrap items-center gap-5">
            <button onClick={onOpenDashboard} className="bg-[#6e557d] hover:bg-[#7c608c] text-white font-sans text-[14px] font-medium px-[22px] py-[11px] rounded-[6px] border border-white/10 shadow-[0_4px_12px_rgba(110,85,125,0.25)] cursor-pointer">Start free trial</button>
            <button onClick={onOpenPkap} className="font-mono text-[13px] text-[#c9ced9] hover:text-white border border-white/10 bg-white/[0.03] px-4 py-2.5 rounded-[5px] cursor-pointer">Open PKAP Analyzer →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-14 max-w-[900px]">
            {['99.9% DETECTION RATE','GLOBAL COVERAGE','REAL-TIME SCANNING'].map((item)=><div key={item} className="bg-white/[0.05] border border-white/10 px-4 py-3 text-[11px] tracking-[0.08em] text-[#b8bec9] text-center">{item}</div>)}
          </div>
        </div>
      </main>

      <section id="about" className="relative max-w-[1520px] w-full mx-auto px-6 sm:px-12 pt-20 pb-24 z-10 border-t border-white/[0.06]">
        <div className="max-w-[980px] mb-14">
          <div className="inline-flex items-center gap-2 text-[13px] text-[#8a909d] mb-4"><span>✦</span><span>ABOUT SHAKTII DEFENSE</span></div>
          <h2 className="font-mono text-[clamp(2.2rem,4.2vw,3.8rem)] font-bold leading-[1.14] text-white uppercase mb-6">ARCHITECTED FOR RESILIENCE.<br/>ENGINEERED FOR SCALE.</h2>
          <p className="text-[14.5px] leading-[1.65] text-[#757b88] max-w-[760px]">SHAKTII replaces fragmented reactive alerts with deterministic, autonomous digital defense. It connects network telemetry, system behavior, security analytics and threat intelligence into one operational layer.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(([tag,val,title,desc])=><div key={title} className="bg-[#17191e]/60 border border-white/[0.08] p-5 rounded-[6px]"><div className="text-[10px] tracking-[0.12em] text-[#8c93a2] mb-2">{tag}</div><div className="text-3xl font-bold text-white mb-1">{val}</div><div className="text-[11.5px] text-[#a8adb8] uppercase">{title}</div><div className="text-[10.5px] text-[#555c69] mt-2">{desc}</div></div>)}
        </div>
      </section>

      <PkapAnalyzerIntro onOpen={onOpenPkap} />

      <section id="features" className="relative max-w-[1520px] w-full mx-auto px-6 sm:px-12 pt-20 pb-24 z-10 border-t border-white/[0.06]">
        <div className="max-w-[980px] mb-14"><div className="inline-flex items-center gap-2 text-[13px] text-[#8a909d] mb-4"><span>✦</span><span>CORE CAPABILITIES</span></div><h2 className="font-mono text-[clamp(2.2rem,4.2vw,3.8rem)] font-bold leading-[1.14] text-white uppercase mb-6">DEFENSE INFRASTRUCTURE<br/>BUILT FOR THE MODERN THREAT LANDSCAPE</h2><p className="text-[14.5px] leading-[1.65] text-[#757b88] max-w-[720px]">Every module is built to detect, correlate, investigate and contain advanced threats without forcing analysts to jump between disconnected tools.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{capabilities.map(([title,desc,badge])=><div key={title} className="bg-[#17191e]/60 border border-white/[0.08] rounded-[8px] p-6"><div className="inline-block bg-white/10 px-2.5 py-1 text-[9.5px] text-[#e2e6eb] tracking-[0.06em] rounded-[3px] mb-4">{badge}</div><h3 className="text-[15px] font-bold text-white uppercase mb-3">{title}</h3><p className="text-[13px] leading-[1.65] text-[#757b88]">{desc}</p></div>)}</div>
      </section>

      <section id="solution" className="relative max-w-[1520px] w-full mx-auto px-6 sm:px-12 pt-20 pb-24 z-10 border-t border-white/[0.06]">
        <div className="max-w-[980px] mb-14"><div className="inline-flex items-center gap-2 text-[13px] text-[#8a909d] mb-4"><span>✦</span><span>DEPLOYMENT MODELS</span></div><h2 className="font-mono text-[clamp(2.2rem,4.2vw,3.8rem)] font-bold leading-[1.14] text-white uppercase mb-6">TAILORED DEFENSE FOR<br/>EVERY ATTACK SURFACE</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{solutions.map(([badge,title,desc])=><div key={title} className="bg-[#17191e]/60 border border-white/[0.08] rounded-[8px] p-6"><div className="text-[9.5px] text-[#c9ced9] tracking-[0.08em] mb-3">{badge}</div><h3 className="text-[16px] font-bold text-white uppercase mb-3">{title}</h3><p className="text-[13px] leading-[1.65] text-[#757b88]">{desc}</p></div>)}</div>
      </section>

      <section id="pricing" className="relative max-w-[1520px] w-full mx-auto px-6 sm:px-12 pt-20 pb-24 z-10 border-t border-white/[0.06]">
        <div className="max-w-[980px] mb-12"><div className="inline-flex items-center gap-2 text-[13px] text-[#8a909d] mb-4"><span>✦</span><span>ACCESS TIERS</span></div><h2 className="font-mono text-[clamp(2.2rem,4.2vw,3.8rem)] font-bold text-white uppercase mb-6">SECURITY THAT SCALES WITH YOU</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{[['STARTER','Developer visibility and PKAP analysis'],['OPERATIONS','Team monitoring, reports and threat intelligence'],['SOVEREIGN','Private deployment and advanced controls']].map(([name,desc],i)=><div key={name} className={`rounded-[8px] p-6 border ${i===1?'border-[#6e557d]/60 bg-[#6e557d]/10':'border-white/[0.08] bg-[#17191e]/60'}`}><div className="text-[11px] text-[#8c93a2] mb-3">{name}</div><div className="text-2xl font-bold text-white mb-4">{i===0?'FREE':i===1?'PRO':'CUSTOM'}</div><p className="text-[13px] text-[#757b88] leading-[1.6] mb-6">{desc}</p><button onClick={i===0?onOpenPkap:onOpenDashboard} className="w-full border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] rounded-[5px] py-2.5 text-[11px] cursor-pointer">GET STARTED</button></div>)}</div>
      </section>

      <section id="contact" className="relative max-w-[1520px] w-full mx-auto px-6 sm:px-12 pt-20 pb-16 z-10 border-t border-white/[0.06]">
        <div className="max-w-[980px] mb-12"><div className="inline-flex items-center gap-2 text-[13px] text-[#8a909d] mb-4"><span>✦</span><span>DIRECT CONTACT</span></div><h2 className="font-mono text-[clamp(2.2rem,4.2vw,3.8rem)] font-bold text-white uppercase mb-6">INITIATE DEFENSE BRIEFING.<br/>CONNECT WITH ENGINEERS.</h2><p className="text-[14.5px] leading-[1.65] text-[#757b88] max-w-[720px]">Use the live console and PKAP Analyzer to demonstrate the platform, investigate logs and explore the complete threat-intelligence workflow.</p></div>
        <footer className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between gap-4 text-[11px] text-[#626875]"><div>© 2026 SHAKTII. ALL RIGHTS RESERVED.</div><div className="flex flex-wrap gap-5"><a href="#about">ABOUT</a><a href="#features">FEATURES</a><a href="#solution">SOLUTION</a><a href="#pricing">PRICING</a></div></footer>
      </section>
    </>
  );
}
