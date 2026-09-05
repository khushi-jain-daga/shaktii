import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { widrsxApi, type WidrsxGraph, type WidrsxGraphNode } from '../../services/widrsxApi';

type RenderNode = {
  id: string;
  type: string;
  vendor: string;
  degree: number;
  inDegree: number;
  outDegree: number;
  x: number;
  y: number;
};

function normalizeNodes(graph: WidrsxGraph): RenderNode[] {
  const raw = graph.nodes || [];
  const total = Math.max(raw.length, 1);
  return raw.map((node, index) => {
    const meta: WidrsxGraphNode = typeof node === 'string' ? { id: node } : node;
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const radius = total <= 6 ? 30 : 36;
    return {
      id: meta.id,
      type: meta.type || 'unknown',
      vendor: meta.vendor || 'unknown',
      degree: meta.degree || 0,
      inDegree: meta.in_degree || 0,
      outDegree: meta.out_degree || 0,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    };
  });
}

export default function NetworkGraph() {
  const [graph, setGraph] = useState<WidrsxGraph>({ nodes: [], edges: [] });
  const [connected, setConnected] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [minWeight, setMinWeight] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const next = await widrsxApi.getGraph({ minWeight, topN: 40, includeMetadata: true });
        if (!cancelled) {
          setGraph(next);
          setConnected(true);
          if (!selectedId && next.nodes?.length) {
            const first = next.nodes[0];
            setSelectedId(typeof first === 'string' ? first : first.id);
          }
        }
      } catch {
        if (!cancelled) setConnected(false);
      }
    };

    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [minWeight, selectedId]);

  const nodes = useMemo(() => normalizeNodes(graph), [graph]);
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const selectedNode = nodes.find((node) => node.id === selectedId) || nodes[0] || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#17191e]/60 border border-white/[0.08] rounded-[8px]">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-[#8c93a2] uppercase tracking-[0.06em]">MIN EDGE WEIGHT:</span>
          {[1, 2, 5, 10].map((value) => (
            <button
              key={value}
              onClick={() => setMinWeight(value)}
              className={`px-3 py-1 rounded-[4px] border transition-colors ${
                minWeight === value
                  ? 'bg-white text-[#0a0b0d] font-bold border-white'
                  : 'bg-[#0a0b0d]/60 text-[#8c93a2] border-white/10 hover:border-white/25 hover:text-white'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <span className={`font-mono text-[10.5px] ${connected ? 'text-emerald-300' : 'text-amber-300'}`}>
          {connected ? `● LIVE • ${nodes.length} NODES • ${graph.edges.length} EDGES` : '● WIDRS-X BACKEND OFFLINE'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#121418] border border-white/[0.08] rounded-[10px] p-6 relative overflow-hidden h-[540px] flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {graph.edges.map((edge, index) => {
              const from = nodeMap.get(edge.src);
              const to = nodeMap.get(edge.dst);
              if (!from || !to) return null;
              const width = Math.min(4, 0.8 + Math.log2(Math.max(edge.weight, 1)) * 0.55);
              return (
                <g key={`${edge.src}-${edge.dst}-${index}`}>
                  <line
                    x1={`${from.x}%`}
                    y1={`${from.y}%`}
                    x2={`${to.x}%`}
                    y2={`${to.y}%`}
                    stroke="rgba(110,85,125,0.6)"
                    strokeWidth={width}
                  />
                  <circle r="2.2" fill="#ffffff">
                    <animate attributeName="cx" from={`${from.x}%`} to={`${to.x}%`} dur={`${2.5 + (index % 4)}s`} repeatCount="indefinite" />
                    <animate attributeName="cy" from={`${from.y}%`} to={`${to.y}%`} dur={`${2.5 + (index % 4)}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}
          </svg>

          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <motion.button
                key={node.id}
                onClick={() => setSelectedId(node.id)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 max-w-[170px] p-2.5 rounded-[6px] font-mono text-left transition-all ${
                  isSelected
                    ? 'bg-white text-[#0a0b0d] font-bold border border-white shadow-[0_0_20px_rgba(255,255,255,0.35)]'
                    : 'bg-[#1a1d24]/95 text-[#dce1e8] border border-[#6e557d]/50 hover:border-white/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-black' : 'bg-[#8f70a1]'}`} />
                  <span className="text-[10.5px] truncate">{node.id}</span>
                </div>
                <div className={`text-[9px] mt-1 ${isSelected ? 'text-black/65' : 'text-[#8c93a2]'}`}>
                  {node.type} • degree {node.degree}
                </div>
              </motion.button>
            );
          })}

          {!nodes.length && (
            <div className="z-10 font-mono text-center text-[#6d7482] text-[12px]">
              {connected ? 'No graph nodes available yet. Generate traffic to populate the topology.' : 'Start the WIDRS-X backend to load live topology.'}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-5">
            <div className="font-mono text-[10.5px] text-[#8c93a2] tracking-[0.08em] uppercase">[NODE TELEMETRY INSPECTOR]</div>
            <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-[#bdc3cf]">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-300' : 'bg-amber-300'}`} />
              <span>{connected ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
          </div>

          {selectedNode ? (
            <div className="space-y-5 font-mono">
              <div>
                <div className="text-[10px] text-[#6d7482] uppercase tracking-[0.08em] mb-1">IDENTIFIER</div>
                <div className="text-white text-[15px] font-bold break-all">{selectedNode.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0a0b0d] border border-white/[0.06] rounded p-3">
                  <div className="text-[9px] text-[#6d7482] uppercase">TYPE</div>
                  <div className="text-[12px] text-white mt-1">{selectedNode.type}</div>
                </div>
                <div className="bg-[#0a0b0d] border border-white/[0.06] rounded p-3">
                  <div className="text-[9px] text-[#6d7482] uppercase">VENDOR</div>
                  <div className="text-[12px] text-white mt-1 truncate">{selectedNode.vendor}</div>
                </div>
                <div className="bg-[#0a0b0d] border border-white/[0.06] rounded p-3">
                  <div className="text-[9px] text-[#6d7482] uppercase">IN DEGREE</div>
                  <div className="text-[18px] text-white mt-1">{selectedNode.inDegree}</div>
                </div>
                <div className="bg-[#0a0b0d] border border-white/[0.06] rounded p-3">
                  <div className="text-[9px] text-[#6d7482] uppercase">OUT DEGREE</div>
                  <div className="text-[18px] text-white mt-1">{selectedNode.outDegree}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] text-[10.5px] text-[#757b88]">
                Edge thickness represents communication weight. The topology refreshes every 5 seconds from the backend graph builder.
              </div>
            </div>
          ) : (
            <div className="text-[#6d7482] font-mono text-[11px]">Select a node to inspect it.</div>
          )}
        </div>
      </div>
    </div>
  );
}
