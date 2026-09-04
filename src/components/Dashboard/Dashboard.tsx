import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BrandLogo from '../common/BrandLogo';
import NetworkGraph from './NetworkGraph';
import TelemetryMetrics from './TelemetryMetrics';
import EventLogs from './EventLogs';
import DefensePolicies from './DefensePolicies';

interface DashboardProps {
  onBack: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'network' | 'logs' | 'policies'>('telemetry');
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full relative bg-[#0a0b0d] bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:100px_100px] bg-[position:center_top] flex flex-col text-white font-mono">
      {/* Film grain noise texture with reduced opacity */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[1] mix-blend-overlay opacity-20 bg-[url('/assets/textures/noise.png')] bg-repeat" />

      {/* Top Console Command Header */}
      <header className="h-[78px] w-full max-w-[1520px] mx-auto px-6 sm:px-12 flex items-center justify-between border-b border-white/[0.06] z-20 relative">
        <div className="flex items-center gap-6">
          <BrandLogo heightClassName="h-9 sm:h-11" />
        </div>

        {/* Right Actions: Time & Back Button */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-[11px] text-[#757b88]">
            {time}
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={onBack}
            className="bg-white/10 hover:bg-white/20 text-white font-mono text-[11.5px] px-3.5 py-1.5 rounded-[4px] border border-white/15 transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>← Return to Site</span>
          </motion.button>
        </div>
      </header>

      {/* Main Console Body */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-6 sm:px-12 py-8 z-10 relative space-y-8">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'telemetry', label: '01 // TELEMETRY & LIVE GRAPHS' },
              { id: 'network', label: '02 // NETWORK TOPOLOGY GRAPH' },
              { id: 'logs', label: '03 // EVENT LOGS & FORENSICS' },
              { id: 'policies', label: '04 // DEFENSE POLICIES & MITRE' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`font-mono text-[11.5px] tracking-[0.06em] px-3.5 py-2 rounded-[4px] border transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-[#0a0b0d] font-bold border-white shadow-[0_2px_8px_rgba(255,255,255,0.25)]'
                    : 'bg-[#17191e]/40 text-[#8c93a2] border-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Display */}
        <div>
          {activeTab === 'telemetry' && <TelemetryMetrics />}
          {activeTab === 'network' && <NetworkGraph />}
          {activeTab === 'logs' && <EventLogs />}
          {activeTab === 'policies' && <DefensePolicies />}
        </div>
      </main>

      {/* Console Bottom Bar */}
      <footer className="h-10 border-t border-white/[0.06] max-w-[1520px] w-full mx-auto px-6 sm:px-12 flex items-center justify-between text-[10.5px] text-[#555c69] z-10 relative">
        <div className="flex items-center gap-4">
          <span>SHAKTII eBPF KERNEL ENGINE: RUNNING</span>
          <span>//</span>
          <span>FIPS 140-3 HSM: SYNCHRONIZED</span>
        </div>
        <div>
          AUTONOMOUS DEFENSE ACTIVE • ZERO UNRESOLVED INCIDENTS
        </div>
      </footer>
    </div>
  );
}
