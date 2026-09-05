const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function accessToken() { return window.localStorage.getItem('shaktii_token'); }
function refreshToken() { return window.localStorage.getItem('shaktii_refresh_token'); }
function saveTokens(token: string, refresh?: string) {
  window.localStorage.setItem('shaktii_token', token);
  if (refresh) window.localStorage.setItem('shaktii_refresh_token', refresh);
}

async function refreshAccessToken() {
  const current = refreshToken();
  if (!current) return false;
  const response = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: current }) });
  if (!response.ok) return false;
  const body = await response.json();
  saveTokens(body.data.token, body.data.refreshToken);
  return true;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const auth = accessToken();
  if (auth) headers.set('Authorization', `Bearer ${auth}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && retry && await refreshAccessToken()) return request<T>(path, init, false);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
  return body.data as T;
}

export type User = { id: string; name: string; email: string; role: 'ADMIN' | 'USER' | 'SECURITY_ANALYST' };
export type SecureFile = { id: string; originalName: string; mimeType: string; size: number; sha256: string; status: 'UPLOADED' | 'ENCRYPTED' | 'VERIFIED' | 'TAMPERED'; createdAt: string };
export type BlockchainRecord = { id: string; transactionId: string; network: string; fileHash: string; verified: boolean; createdAt: string; file?: { originalName: string; status: string } };
export type SecurityEvent = { id: string; type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; description: string; resource?: string; ipAddress?: string; status: string; createdAt: string };
export type AuditLog = { id: string; action: string; resource?: string; status: string; createdAt: string };
export type AnalyticsOverview = { summary: { files: number; verifiedFiles: number; tamperedFiles: number; blockchainRecords: number; audits: number; securityEvents: number }; timeline: Array<{ day: string; activity: number; success: number; failed: number }> };
export type DashboardSummary = { protectedFiles: number; verifiedFiles: number; failedVerifications: number; activeUsers: number; securityAlerts: number; criticalAlerts: number; blockchainRecords: number; recentActivity: AuditLog[] };
export type ReportSummary = { generatedAt: string; files: number; verified: number; tampered: number; blockchain: number; security: number; audits: number };

type SessionData = { token: string; refreshToken: string; user: User };
function persistSession(data: SessionData) {
  saveTokens(data.token, data.refreshToken);
  window.localStorage.setItem('shaktii_user', JSON.stringify(data.user));
  return data;
}

export const nodeApi = {
  login: async (email: string, password: string) => persistSession(await request<SessionData>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })),
  register: async (name: string, email: string, password: string) => persistSession(await request<SessionData>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })),
  logout() {
    const refresh = refreshToken();
    if (refresh) void fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: refresh }) });
    window.localStorage.removeItem('shaktii_token');
    window.localStorage.removeItem('shaktii_refresh_token');
    window.localStorage.removeItem('shaktii_user');
  },
  currentUser(): User | null { try { return JSON.parse(window.localStorage.getItem('shaktii_user') || 'null') as User | null; } catch { return null; } },
  me: () => request<User>('/auth/me'),
  dashboard: () => request<DashboardSummary>('/dashboard'),
  files: () => request<SecureFile[]>('/files'),
  upload(file: File) { const body = new FormData(); body.append('file', file); return request<SecureFile>('/files/upload', { method: 'POST', body }); },
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
  reportSummary: () => request<ReportSummary>('/reports/summary'),
  reportCsvUrl: () => `${API_URL}/reports/export.csv`,
  authHeader: () => accessToken() ? { Authorization: `Bearer ${accessToken()}` } : {},
};
