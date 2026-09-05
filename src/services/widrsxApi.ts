export interface WidrsxHealth {
  status: string;
  traffic_logs_count: number;
  alerts_count: number;
}

export interface WidrsxAlert {
  id: number;
  timestamp: number;
  type: string;
  severity: string;
  description: string;
  metadata?: string | Record<string, unknown> | null;
  attack_type?: string | null;
}

export interface WidrsxLog extends WidrsxAlert {
  src_ip?: string;
  dst_ip?: string;
  protocol?: string;
  packet_length?: number;
  log_kind?: 'attack' | 'traffic' | string;
}

export interface WidrsxGraphNode {
  id: string;
  type?: string;
  vendor?: string;
  degree?: number;
  in_degree?: number;
  out_degree?: number;
}

export interface WidrsxGraphEdge {
  src: string;
  dst: string;
  weight: number;
}

export interface WidrsxGraph {
  nodes: Array<string | WidrsxGraphNode>;
  edges: WidrsxGraphEdge[];
}

const API_BASE = (import.meta.env.VITE_WIDRSX_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`WIDRS-X API ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const widrsxApi = {
  getHealth: () => apiFetch<WidrsxHealth>('/health'),

  getAlerts: (limit = 100) =>
    apiFetch<WidrsxAlert[]>(`/alerts?limit=${encodeURIComponent(limit)}`),

  getLogs: (options?: { limit?: number; severity?: string; search?: string }) => {
    const params = new URLSearchParams();
    params.set('limit', String(options?.limit ?? 100));
    if (options?.severity && options.severity !== 'ALL') params.set('severity', options.severity);
    if (options?.search) params.set('search', options.search);
    return apiFetch<WidrsxLog[]>(`/logs?${params.toString()}`);
  },

  getTraffic: (limit = 100) =>
    apiFetch<WidrsxLog[]>(`/traffic?limit=${encodeURIComponent(limit)}`),

  getDevices: (limit = 100) =>
    apiFetch<Array<{ ip: string }>>(`/devices?limit=${encodeURIComponent(limit)}`),

  getGraph: (options?: { minWeight?: number; topN?: number; includeMetadata?: boolean }) => {
    const params = new URLSearchParams();
    params.set('min_weight', String(options?.minWeight ?? 1));
    params.set('include_nodes', 'true');
    params.set('include_metadata', String(options?.includeMetadata ?? true));
    if (options?.topN) params.set('top_n', String(options.topN));
    return apiFetch<WidrsxGraph>(`/graph?${params.toString()}`);
  },
};

export { API_BASE as WIDRSX_API_BASE };
