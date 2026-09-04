import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TelemetryMetrics() {
  const [packetCount, setPacketCount] = useState(42819400);

  // Simulate real-time counter ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketCount((prev) => prev + Math.floor(Math.random() * 240 + 60));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* 4 Core Headline Defense Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            tag: '[THROUGHPUT]',
            val: `${(packetCount / 1000000).toFixed(2)}M`,
            unit: 'OPS / SEC',
            title: 'PACKET INGESTION RATE',
            desc: 'Hardware eBPF kernel pipeline',
          },
          {
            tag: '[LATENCY]',
            val: '< 0.02',
            unit: 'MILLISECONDS',
            title: 'EDGE RESPONSE TIME',
            desc: 'Deterministic zero-jitter bypass',
          },
          {
            tag: '[MITIGATED]',
            val: '1,492',
            unit: 'VECTORS TODAY',
            title: 'ZERO-DAYS CONTAINED',
            desc: '100% autonomous mitigation',
          },
          {
            tag: '[RESILIENCE]',
            val: '99.999%',
            unit: 'UPTIME SLA',
            title: 'GLOBAL MESH CONSENSUS',
            desc: '142 nodes active across 3 enclaves',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-[#17191e]/60 border border-white/[0.08] p-5 rounded-[6px] hover:border-white/20 transition-colors"
          >
            <div className="text-[10px] tracking-[0.12em] text-[#8c93a2] uppercase mb-2">
              {stat.tag}
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {stat.val}
              </span>
              <span className="text-[10px] text-[#6e557d] font-bold">
                {stat.unit}
              </span>
            </div>
            <div className="text-[11.5px] text-[#a8adb8] font-medium uppercase tracking-[0.04em]">
              {stat.title}
            </div>
            <div className="text-[10.5px] text-[#555c69] mt-2">
              {stat.desc}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time Ingestion Velocity Waveform (8 cols) */}
        <div className="lg:col-span-8 bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#8a909d] mb-1">
                <span className="text-[9px] text-[#bdc3cf]">✦</span>
                <span>REAL-TIME TELEMETRY</span>
              </div>
              <h3 className="font-mono text-[16px] font-bold text-white uppercase tracking-tight">
                PACKET INGESTION & ZERO-DAY NEUTRALIZATION VELOCITY
              </h3>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-1 bg-[#6e557d] rounded-full" />
                <span>CLEAN TRAFFIC</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#a8adb8]">
                <span className="w-2.5 h-1 bg-[#a8adb8] rounded-full" />
                <span>INTERCEPTED</span>
              </div>
            </div>
          </div>

          {/* SVG Animated Graph */}
          <div className="h-[260px] w-full relative">
            <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6e557d" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6e557d" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[40, 90, 140, 190].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="700"
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Clean Area Wave */}
              <polygon
                points="0,220 0,140 80,120 160,150 240,100 320,130 400,80 480,110 560,70 640,90 700,60 700,220"
                fill="url(#purpleGlow)"
              />

              {/* Clean Path Line */}
              <motion.path
                d="M0,140 Q40,110 80,120 T160,150 T240,100 T320,130 T400,80 T480,110 T560,70 T640,90 T700,60"
                fill="none"
                stroke="#6e557d"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />

              {/* Attack Spikes (Subtle White Dotted Line) */}
              <motion.path
                d="M0,200 Q80,210 160,190 T240,210 T320,170 T400,200 T480,160 T560,190 T640,150 T700,180"
                fill="none"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Peak Indicators */}
              <circle cx="400" cy="80" r="4" fill="#ffffff" />
              <circle cx="560" cy="70" r="4" fill="#ffffff" />
            </svg>

            {/* Time labels */}
            <div className="flex justify-between font-mono text-[10px] text-[#555c69] pt-2">
              <span>-60s</span>
              <span>-45s</span>
              <span>-30s</span>
              <span>-15s</span>
              <span className="text-white">LIVE NOW</span>
            </div>
          </div>
        </div>

        {/* Threat Distribution & Vectors (4 cols) */}
        <div className="lg:col-span-4 bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6 flex flex-col justify-between">
          <div>
            <div className="font-mono text-[10.5px] text-[#8c93a2] tracking-[0.08em] uppercase mb-1">
              [VECTOR MITIGATION]
            </div>
            <h3 className="font-mono text-[16px] font-bold text-white uppercase tracking-tight mb-5">
              ATTACK BREAKDOWN (24H)
            </h3>

            <div className="space-y-4 font-mono text-[11.5px]">
              {[
                { name: 'POLYMORPHIC SHELLCODE', pct: 42, count: '626', color: '#6e557d' },
                { name: 'SYN FLOOD & AMP DDoS', pct: 28, count: '417', color: '#8c93a2' },
                { name: 'DNS TUNNEL EXFILTRATION', pct: 16, count: '238', color: '#a8adb8' },
                { name: 'KERNEL HOOK HIJACK', pct: 9, count: '134', color: '#c4c8d4' },
                { name: 'BGP HIJACK ANOMALIES', pct: 5, count: '77', color: '#e2e6eb' },
              ].map((v, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#a8adb8]">{v.name}</span>
                    <span className="text-white font-medium">{v.count} ({v.pct}%)</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${v.pct}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      style={{ backgroundColor: v.color }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-white/[0.06] font-mono text-[11px] text-[#757b88] flex items-center justify-between">
            <span>FALSE POSITIVE RATE:</span>
            <span className="text-white font-bold">0.00008%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
