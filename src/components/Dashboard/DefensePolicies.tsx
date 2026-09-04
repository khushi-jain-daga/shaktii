import { useState } from 'react';

export default function DefensePolicies() {
  const [sensitivity, setSensitivity] = useState(94);
  const [policies, setPolicies] = useState([
    {
      id: 'POL-01',
      name: 'AUTONOMOUS eBPF PACKET DROP',
      desc: 'Drops malformed or malicious packet headers at NIC driver layer before reaching Linux network stack.',
      enabled: true,
      tier: 'KERNEL LAYER',
    },
    {
      id: 'POL-02',
      name: 'POLYMORPHIC HEURISTIC ENGINE',
      desc: 'Real-time consensus scoring across 140+ sovereign edge sentinels to intercept novel zero-days.',
      enabled: true,
      tier: 'DETECTION ENGINE',
    },
    {
      id: 'POL-03',
      name: 'SOVEREIGN AIRGAP HSM ATTESTATION',
      desc: 'Enforces hardware cryptographic sign-off for any root-level config mutations.',
      enabled: true,
      tier: 'HARDWARE SECURITY',
    },
    {
      id: 'POL-04',
      name: 'AUTOMATED NODE ISOLATION',
      desc: 'Instantly segregates compromised worker pods into honeynet VLAN without interrupting fleet traffic.',
      enabled: false,
      tier: 'ORCHESTRATION',
    },
  ]);

  const togglePolicy = (id: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: MITRE ATT&CK Matrix Coverage */}
      <div className="bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#8a909d] mb-1">
              <span className="text-[9px] text-[#bdc3cf]">✦</span>
              <span>TACTICAL FRAMEWORK</span>
            </div>
            <h3 className="font-mono text-[16px] font-bold text-white uppercase tracking-tight">
              MITRE ATT&CK ENTERPRISE MATRIX COVERAGE
            </h3>
          </div>
          <div className="font-mono text-[12px] text-white font-bold bg-white/10 px-3 py-1 rounded border border-white/20">
            99.6% OVERALL INTERCEPTION RATE
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-[11px]">
          {[
            { tactic: 'INITIAL ACCESS', score: '98.4%', status: 'ACTIVE' },
            { tactic: 'EXECUTION', score: '100%', status: 'SHIELDED' },
            { tactic: 'PRIV ESCALATION', score: '99.8%', status: 'LOCKED' },
            { tactic: 'DEFENSE EVASION', score: '99.5%', status: 'ACTIVE' },
            { tactic: 'LATERAL MOVE', score: '99.9%', status: 'AIRGAPPED' },
            { tactic: 'EXFILTRATION', score: '100%', status: 'BLOCKED' },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-[#0a0b0d] p-3 rounded-[6px] border border-white/[0.06] flex flex-col justify-between"
            >
              <span className="text-[9.5px] text-[#6d7482] uppercase">{t.tactic}</span>
              <span className="text-lg font-bold text-white my-1">{t.score}</span>
              <span className="text-[9px] text-[#6e557d] font-semibold">{t.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Policy Toggles & Sensitivity Tuning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Defense Rules (8 cols) */}
        <div className="lg:col-span-8 bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6">
          <div className="font-mono text-[10.5px] text-[#8c93a2] tracking-[0.08em] uppercase mb-1">
            [AUTONOMOUS MITIGATION POLICIES]
          </div>
          <h3 className="font-mono text-[16px] font-bold text-white uppercase tracking-tight mb-6">
            CORE ENCLAVE RULES & KERNEL PROBES
          </h3>

          <div className="space-y-4 font-mono">
            {policies.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-[#0a0b0d] border border-white/[0.06] rounded-[6px] flex items-start justify-between gap-4 hover:border-white/15 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9.5px] text-[#6d7482]">{p.id}</span>
                    <span className="text-[9.5px] text-[#6e557d] font-bold uppercase">{p.tier}</span>
                  </div>
                  <div className="text-[13px] font-bold text-white mb-1">{p.name}</div>
                  <div className="text-[11px] text-[#757b88] leading-[1.5] max-w-[560px]">{p.desc}</div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePolicy(p.id)}
                  className={`px-3 py-1.5 rounded-[4px] text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                    p.enabled
                      ? 'bg-[#6e557d] text-white border border-[#8f70a1]'
                      : 'bg-white/5 text-[#6d7482] border border-white/10 hover:text-white'
                  }`}
                >
                  {p.enabled ? '✓ ACTIVE' : 'STANDBY'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sensitivity & Consensus Tuning (4 cols) */}
        <div className="lg:col-span-4 bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6 flex flex-col justify-between">
          <div>
            <div className="font-mono text-[10.5px] text-[#8c93a2] tracking-[0.08em] uppercase mb-1">
              [HEURISTIC TUNING]
            </div>
            <h3 className="font-mono text-[16px] font-bold text-white uppercase tracking-tight mb-5">
              CONSENSUS SENSITIVITY
            </h3>

            <div className="space-y-6 font-mono text-[12px]">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#8c93a2]">ANOMALY CONFIDENCE</span>
                  <span className="text-white font-bold">{sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="99"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full accent-[#6e557d] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#555c69] mt-1">
                  <span>AGGRESSIVE (60%)</span>
                  <span>BALANCED</span>
                  <span>STRICT (99%)</span>
                </div>
              </div>

              <div className="p-3 bg-[#0a0b0d] rounded-[6px] border border-white/[0.06] space-y-2 text-[11px]">
                <div className="text-white font-bold uppercase mb-1">CURRENT POSTURE:</div>
                <div className="flex justify-between text-[#757b88]">
                  <span>QUORUM THRESHOLD:</span>
                  <span className="text-white">3/4 ENCLAVES</span>
                </div>
                <div className="flex justify-between text-[#757b88]">
                  <span>ISOLATION SPEED:</span>
                  <span className="text-white">&lt; 0.04ms</span>
                </div>
                <div className="flex justify-between text-[#757b88]">
                  <span>AIRGAP KEYS:</span>
                  <span className="text-white">HARDWARE LOCKED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06]">
            <button
              type="button"
              className="w-full bg-[#6e557d] hover:bg-[#7c608c] text-white font-sans text-[13px] font-medium py-2.5 rounded-[6px] border border-black/10 transition-colors cursor-pointer"
            >
              Commit Policy State →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
