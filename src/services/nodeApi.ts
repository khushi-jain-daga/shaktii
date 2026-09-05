const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function token() {
  return window.localStorage.getItem('shaktii_token');
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const auth = token();
  if (auth) headers.set('Authorization', `Bearer ${auth}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
  return body.data as T;
}

export type User = { id: string; name: string; email: string; role: string };
export type SecureFile = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  sha256: string;
  status: 'UPLOADED' | 'ENCRYPTED' | 'VERIFIED' | 'TAMPERED';
  createdAt: string;
};
export type BlockchainRecord = {
  id: string;
  transactionId: string;
  network: string;
  fileHash: string;
  verified: boolean;
  createdAt: string;
  file?: { originalName: string; status: string };
};
export type SecurityEvent = {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  resource?: string;
  ipAddress?: string;
  status: string;
  createdAt: string;
};
export type AuditLog = {
  id: string;
  action: string;
  resource?: string;
  status: string;
  createdAt: string;
};
export type AnalyticsOverview = {
  summary: {
    files: number;
    verifiedFiles: number;
    tamperedFiles: number;
    blockchainRecords: number;
    audits: number;
    securityEvents: number;
  };
  timeline: Array<{ day: string; activity: number; success: number; failed: number }>;
};

export const nodeApi = {
  async login(email: string, password: string) {
    const data = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    window.localStorage.setItem('shaktii_token', data.token);
    return data;
  },
  logout() {
    window.localStorage.removeItem('shaktii_token');
  },
  me: () => request<User>('/auth/me'),
  files: () => request<SecureFile[]>('/files'),
  upload(file: File) {
    const body = new FormData();
    body.append('file', file);
    return request<SecureFile>('/files/upload', { method: 'POST', body });
  },
  encrypt: (id: string) => request<SecureFile>(`/files/${id}/encrypt`, { method: 'POST' }),
  verify: (id: string) => request<{ valid: boolean; storedHash: string; currentHash: string }>(`/files/${id}/verify`, { method: 'POST' }),
  blockchainRecords: () => request<BlockchainRecord[]>('/blockchain'),
  registerBlockchain: (fileId: string) => request<BlockchainRecord>(`/blockchain/register/${fileId}`, { method: 'POST' }),
  verifyBlockchain: (id: string) => request<BlockchainRecord>(`/blockchain/verify/${id}`, { method: 'POST' }),
  securityOverview: () => request<{ total: number; open: number; critical: number; high: number }>('/security/overview'),
  securityEvents: () => request<SecurityEvent[]>('/security/events'),
  resolveSecurityEvent: (id: string) => request<SecurityEvent>(`/security/events/${id}/resolve`, { method: 'PATCH' }),
  analyticsOverview: () => request<AnalyticsOverview>('/analytics/overview'),
  auditLogs: () => request<AuditLog[]>('/analytics/audit-logs'),
};
