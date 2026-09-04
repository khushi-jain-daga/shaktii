import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NetworkNode {
  id: string;
  name: string;
  ip: string;
  region: string;
  x: number; // percentage
  y: number; // percentage
  type: 'core' | 'edge' | 'gateway' | 'airgap';
  status: 'healthy' | 'intercepting' | 'isolated';
  latency: string;
  throughput: string;
  threatsBlocked: number;
}

const initialNodes: NetworkNode[] = [
  { id: 'core-01', name: 'SOVEREIGN_CORE_01', ip: '10.240.0.1', region: 'Reston, VA', x: 50, y: 50, type: 'core', status: 'healthy', latency: '0.12ms', throughput: '18.4 Gbps', threatsBlocked: 1420 },
  { id: 'edge-01', name: 'NODE-ALPHA-US', ip: '104.28.19.4', region: 'US-East (N. Virginia)', x: 26, y: 32, type: 'edge', status: 'healthy', latency: '0.45ms', throughput: '4.2 Gbps', threatsBlocked: 384 },
  { id: 'edge-02', name: 'NODE-BRAVO-EU', ip: '185.190.140.2', region: 'EU-Central (Frankfurt)', x: 74, y: 30, type: 'edge', status: 'healthy', latency: '0.62ms', throughput: '5.1 Gbps', threatsBlocked: 512 },
  { id: 'edge-03', name: 'NODE-CHARLIE-APAC', ip: '133.242.18.91', region: 'APAC (Tokyo)', x: 80, y: 68, type: 'edge', status: 'healthy', latency: '0.88ms', throughput: '3.8 Gbps', threatsBlocked: 219 },
  { id: 'edge-04', name: 'NODE-DELTA-IN', ip: '103.21.244.12', region: 'IN-South (Bengaluru)', x: 30, y: 72, type: 'edge', status: 'healthy', latency: '0.74ms', throughput: '4.6 Gbps', threatsBlocked: 405 },
  { id: 'gw-01', name: 'ANYCAST-GATEWAY-A', ip: '198.41.128.5', region: 'Global Edge BGP', x: 15, y: 52, type: 'gateway', status: 'healthy', latency: '0.18ms', throughput: '22.0 Gbps', threatsBlocked: 940 },
  { id: 'gw-02', name: 'ANYCAST-GATEWAY-B', ip: '198.41.129.5', region: 'Global Edge BGP', x: 86, y: 48, type: 'gateway', status: 'healthy', latency: '0.19ms', throughput: '21.4 Gbps', threatsBlocked: 870 },
  { id: 'airgap-01', name: 'HSM-VAULT-AIRGAP', ip: 'ISOLATED_PHYSICAL', region: 'FIPS 140-3 Hardware', x: 50, y: 84, type: 'airgap', status: 'healthy', latency: '0.04ms', throughput: '1.2 Gbps', threatsBlocked: 42 },
];

const connections = [
  ['core-01', 'edge-01'],
  ['core-01', 'edge-02'],
  ['core-01', 'edge-03'],
  ['core-01', 'edge-04'],
  ['core-01', 'airgap-01'],
  ['gw-01', 'edge-01'],
  ['gw-01', 'edge-04'],
  ['gw-02', 'edge-02'],
  ['gw-02', 'edge-03'],
  ['edge-01', 'edge-02'],
  ['edge-03', 'edge-04'],
];

export default function NetworkGraph() {
  const [nodes, setNodes] = useState<NetworkNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<NetworkNode>(initialNodes[0]);
  const [simulating, setSimulating] = useState(false);
  const [attackLog, setAttackLog] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState('ALL');

  const handleSimulateAttack = () => {
    if (simulating) return;
    setSimulating(true);
    setAttackLog('⚠️ INTRUSION DETECTED: Polymorphic zero-day flood targeting NODE-ALPHA-US (104.28.19.4)');

    // Set node status to intercepting
    setNodes((prev) =>
      prev.map((n) => (n.id === 'edge-01' ? { ...n, status: 'intercepting' } : n))
    );

    setTimeout(() => {
      setAttackLog('🛡️ eBPF KERNEL SHIELD: Rate limit applied. 14,200 malicious SYN packets dropped in 0.04ms.');
      setNodes((prev) =>
        prev.map((n) =>
          n.id === 'edge-01' ? { ...n, threatsBlocked: n.threatsBlocked + 142 } : n
        )
      );
    }, 1800);

    setTimeout(() => {
      setAttackLog('✓ THREAT NEUTRALIZED: Hostile IP prefix quarantined globally. All clusters nominal.');
      setNodes((prev) =>
        prev.map((n) => (n.id === 'edge-01' ? { ...n, status: 'healthy' } : n))
      );
      setSimulating(false);
    }, 4000);
  };

  // Node coordinate lookup
  const getNodePos = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 50, y: 50 };
  };

  const filteredNodes = nodes.filter((n) => {
    if (activeRegion === 'ALL') return true;
    if (activeRegion === 'US') return n.region.includes('US');
    if (activeRegion === 'EU') return n.region.includes('EU');
    if (activeRegion === 'APAC') return n.region.includes('APAC') || n.region.includes('IN');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#17191e]/60 border border-white/[0.08] rounded-[8px]">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#8c93a2] uppercase tracking-[0.06em]">FILTER REGION:</span>
          <div className="flex gap-1.5 font-mono text-[11px]">
            {['ALL', 'US', 'EU', 'APAC'].map((reg) => (
              <button
                key={reg}
                onClick={() => setActiveRegion(reg)}
                className={`px-3 py-1 rounded-[4px] border transition-colors cursor-pointer ${
                  activeRegion === reg
                    ? 'bg-white text-[#0a0b0d] font-bold border-white'
                    : 'bg-[#0a0b0d]/60 text-[#8c93a2] border-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateAttack}
            disabled={simulating}
            className={`font-mono text-[11.5px] px-4 py-1.5 rounded-[4px] border transition-all cursor-pointer flex items-center gap-2 ${
              simulating
                ? 'bg-white text-black font-bold border-white animate-pulse'
                : 'bg-[#6e557d] hover:bg-[#7c608c] text-white border-white/10'
            }`}
          >
            <span>{simulating ? 'DEFENSE ACTIVE...' : '⚡ SIMULATE INTRUSION'}</span>
          </button>
        </div>
      </div>

      {/* Live Simulation Alert Feed */}
      <AnimatePresence>
        {attackLog && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-[6px] font-mono text-[12px] bg-[#17191e] text-white border border-white/20"
          >
            {attackLog}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Interactive Canvas + Node Telemetry Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Network Topology Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-[#121418] border border-white/[0.08] rounded-[10px] p-6 relative overflow-hidden h-[540px] flex items-center justify-center">
          {/* Subtle grid lines background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          {/* SVG Connection Lines & Animated Pulses */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map(([fromId, toId], i) => {
              const from = getNodePos(fromId);
              const to = getNodePos(toId);
              const isAttackPath =
                simulating && (fromId === 'edge-01' || toId === 'edge-01');

              return (
                <g key={i}>
                  {/* Base Wire Path */}
                  <line
                    x1={`${from.x}%`}
                    y1={`${from.y}%`}
                    x2={`${to.x}%`}
                    y2={`${to.y}%`}
                    stroke={isAttackPath ? '#6e557d' : 'rgba(255, 255, 255, 0.12)'}
                    strokeWidth={isAttackPath ? '2' : '1'}
                    strokeDasharray={isAttackPath ? '4 2' : 'none'}
                  />

                  {/* Flowing packet circles */}
                  <circle r="2.5" fill={isAttackPath ? '#ffffff' : '#6e557d'}>
                    <animate
                      attributeName="cx"
                      from={`${from.x}%`}
                      to={`${to.x}%`}
                      dur={`${3 + (i % 3)}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      from={`${from.y}%`}
                      to={`${to.y}%`}
                      dur={`${3 + (i % 3)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Render Nodes as Interactive Badges */}
          {filteredNodes.map((node) => {
            const isSelected = selectedNode.id === node.id;
            const isIntercepting = node.status === 'intercepting';

            return (
              <motion.div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-[6px] font-mono cursor-pointer transition-all duration-200 select-none ${
                  isIntercepting
                    ? 'bg-white text-[#0a0b0d] border-2 border-white font-bold shadow-[0_0_20px_rgba(255,255,255,0.6)] animate-pulse'
                    : isSelected
                    ? 'bg-white text-[#0a0b0d] font-bold border border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                    : node.type === 'core'
                    ? 'bg-[#6e557d]/80 text-white border border-[#8f70a1] shadow-[0_0_15px_rgba(110,85,125,0.4)]'
                    : 'bg-[#1a1d24]/90 text-[#dce1e8] border border-white/15 hover:border-white/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isIntercepting
                        ? 'bg-black animate-ping'
                        : isSelected
                        ? 'bg-black'
                        : node.type === 'core'
                        ? 'bg-white'
                        : 'bg-[#bdc3cf]'
                    }`}
                  />
                  <div className="text-[11px] font-medium tracking-tight">
                    {node.name}
                  </div>
                </div>

                <div
                  className={`text-[9.5px] mt-0.5 ${
                    isSelected ? 'text-black/70' : 'text-[#8c93a2]'
                  }`}
                >
                  {node.ip} • {node.latency}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Node Telemetry Inspector Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-5">
              <div className="font-mono text-[10.5px] text-[#8c93a2] tracking-[0.08em] uppercase">
                [NODE TELEMETRY INSPECTOR]
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-[#bdc3cf]">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>ONLINE</span>
              </div>
            </div>

            <div className="space-y-4 font-mono">
              <div>
                <div className="text-[10px] text-[#6d7482] uppercase tracking-[0.08em] mb-0.5">IDENTIFIER</div>
                <div className="text-[16px] font-bold text-white">{selectedNode.name}</div>
                <div className="text-[11px] text-[#a8adb8] mt-0.5">{selectedNode.region}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#0a0b0d] p-2.5 rounded-[5px] border border-white/[0.06]">
                  <div className="text-[9.5px] text-[#6d7482]">IP ADDRESS</div>
                  <div className="text-[12px] text-white font-medium mt-0.5">{selectedNode.ip}</div>
                </div>
                <div className="bg-[#0a0b0d] p-2.5 rounded-[5px] border border-white/[0.06]">
                  <div className="text-[9.5px] text-[#6d7482]">NODE TYPE</div>
                  <div className="text-[12px] text-white font-medium uppercase mt-0.5">{selectedNode.type}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0a0b0d] p-2.5 rounded-[5px] border border-white/[0.06]">
                  <div className="text-[9.5px] text-[#6d7482]">KERNEL LATENCY</div>
                  <div className="text-[13px] text-white font-bold mt-0.5">{selectedNode.latency}</div>
                </div>
                <div className="bg-[#0a0b0d] p-2.5 rounded-[5px] border border-white/[0.06]">
                  <div className="text-[9.5px] text-[#6d7482]">BANDWIDTH CAP</div>
                  <div className="text-[13px] text-white font-bold mt-0.5">{selectedNode.throughput}</div>
                </div>
              </div>

              <div className="bg-[#0a0b0d] p-3 rounded-[6px] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#6d7482]">THREATS CONTAINED</span>
                  <span className="text-[13px] font-bold text-white">{selectedNode.threatsBlocked.toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#6e557d] h-full rounded-full w-[78%]" />
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[#757b88] space-y-1.5">
                <div className="flex justify-between">
                  <span>eBPF XDP BYPASS:</span>
                  <span className="text-white">ENFORCED</span>
                </div>
                <div className="flex justify-between">
                  <span>PACKET DROP RATIO:</span>
                  <span className="text-white">0.000%</span>
                </div>
                <div className="flex justify-between">
                  <span>SOVEREIGN AIRGAP:</span>
                  <span className="text-white">FIPS 140-3 READY</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <button
              onClick={() => setSelectedNode(selectedNode)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-mono text-[11.5px] py-2 rounded-[4px] border border-white/10 transition-colors cursor-pointer"
            >
              DUMP NODE HEURISTICS →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
