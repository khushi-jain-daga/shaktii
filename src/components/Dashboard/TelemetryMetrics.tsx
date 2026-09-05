import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { widrsxApi, type WidrsxAlert, type WidrsxHealth, type WidrsxLog } from '../../services/widrsxApi';

export default function TelemetryMetrics() {
  const [health, setHealth] = useState<WidrsxHealth | null>(null);
  const [traffic, setTraffic] = useState<WidrsxLog[]>([]);
  const [alerts, setAlerts] = useState<WidrsxAlert[]>([]);
  const [connected, setConnected] = useState(false);
  const [packetsPerSecond, setPacketsPerSecond] = useState(0);
  const previousCount = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [nextHealth, nextTraffic, nextAlerts] = await Promise.all([
          widrsxApi.getHealth(),
          widrsxApi.getTraffic(100),
          widrsxApi.getAlerts(100),
        ]);

        if (cancelled) return;

        if (previousCount.current !== null) {
          setPacketsPerSecond(Math.max(0, (nextHealth.traffic_logs_count - previousCount.current) / 5));
        }
        previousCount.current = nextHealth.traffic_logs_count;
        setHealth(nextHealth);
        setTraffic(nextTraffic);
        setAlerts(nextAlerts);
        setConnected(true);
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
  }, []);

  const protocolBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    traffic.forEach((row) => {
      const key = (row.protocol || 'OTHER').toUpperCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const total = Math.max(traffic.length, 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));
  }, [traffic]);

  const criticalCount = alerts.filter((a) => ['critical', 'high'].includes((a.severity || '').toLowerCase())).length;
  const attackTraffic = traffic.filter((t) => {
    const attack = String(t.attack_type || '').toLowerCase();
    return attack && !['normal', 'none', 'unknown'].includes(attack);
  }).length;

  const metrics = [
    {
      tag: '[PACKETS]',
      val: health ? health.traffic_logs_count.toLocaleString() : '—',
      unit: 'RECORDED',
      title: 'TRAFFIC LOGS',
      desc: connected ? `${packetsPerSecond.toFixed(1)} packets/sec over last poll` : 'Waiting for WIDRS-X backend',
    },
    {
      tag: '[ALERTS]',
      val: health ? health.alerts_count.toLocaleString() : '—',
      unit: 'TOTAL',
      title: 'DETECTED EVENTS',
      desc: `${criticalCount} critical/high in latest sample`,
    },
    {
      tag: '[THREATS]',
      val: String(attackTraffic),
      unit: 'LATEST 100',
      title: 'ATTACK-LABELED TRAFFIC',
      desc: 'Derived from WIDRS-X traffic classifications',
    },
    {
      tag: '[ENGINE]',
      val: connected ? 'LIVE' : 'OFFLINE',
      unit: connected ? 'CONNECTED' : 'RETRYING',
      title: 'WIDRS-X STATUS',
      desc: connected ? 'Real telemetry is being polled every 5 seconds' : 'Start Flask API or set VITE_WIDRSX_API_URL',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((stat, i) => (
          <motion.div
            key={stat.tag}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-[#17191e]/60 border border-white/[0.08] p-5 rounded-[6px] hover:border-white/20 transition-colors"
          >
            <div className="text-[10px] tracking-[0.12em] text-[#8c93a2] uppercase mb-2">{stat.tag}</div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stat.val}</span>
              <span className="text-[10px] text-[#6e557d] font-bold">{stat.unit}</span>
            </div>
            <div className="text-[11.5px] text-[#a8adb8] font-medium uppercase tracking-[0.04em]">{stat.title}</div>
            <div className="text-[10.5px] text-[#555c69] mt-2">{stat.desc}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-mono text-[10.5px] text-[#8c93a2] tracking-[0.08em] uppercase mb-1">[LIVE TRAFFIC SAMPLE]</div>
              <h3 className="font-mono text-[16px] font-bold text-white uppercase tracking-tight">RECENT PACKET ACTIVITY</h3>
            </div>
            <span className={`font-mono text-[10.5px] ${connected ? 'text-emerald-300' : 'text-amber-300'}`}>
              {connected ? '● LIVE' : '● OFFLINE'}
            </span>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            {traffic.slice(0, 8).map((row) => (
              <div key={row.id} className="grid grid-cols-[90px_1fr_70px_70px] gap-3 items-center py-2 border-b border-white/[0.05]">
                <span className="text-[#8c93a2]">{row.protocol || '—'}</span>
                <span className="text-white truncate">{row.src_ip || 'unknown'} → {row.dst_ip || 'unknown'}</span>
                <span className="text-[#a8adb8] text-right">{row.packet_length ?? '—'} B</span>
                <span className="text-[#6e557d] text-right">{row.attack_type || 'normal'}</span>
              </div>
            ))}
            {!traffic.length && <div className="text-[#6d7482] py-12 text-center">No traffic records available yet.</div>}
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#17191e]/60 border border-white/[0.08] rounded-[10px] p-6">
          <div className="font-mono text-[10.5px] text-[#8c93a2] tracking-[0.08em] uppercase mb-1">[PROTOCOL DISTRIBUTION]</div>
          <h3 className="font-mono text-[16px] font-bold text-white uppercase tracking-tight mb-5">LATEST 100 PACKETS</h3>

          <div className="space-y-4 font-mono text-[11.5px]">
            {protocolBreakdown.map((item, i) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#a8adb8]">{item.name}</span>
                  <span className="text-white font-medium">{item.count} ({item.pct}%)</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="h-full rounded-full bg-[#6e557d]"
                  />
                </div>
              </div>
            ))}
            {!protocolBreakdown.length && <div className="text-[#6d7482] py-8 text-center">No protocol data.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
