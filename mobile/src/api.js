import { fetch as expoFetch } from 'expo/fetch';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000').replace(/\/$/, '');
let token = '';

export function setApiToken(value) {
  token = value || '';
}

async function parseJson(response) {
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { error: text || `HTTP ${response.status}` };
  }
  if (!response.ok) throw new Error(payload.error || `Request failed with HTTP ${response.status}`);
  return payload;
}

export async function demoLogin(email, password) {
  const response = await expoFetch(`${API_URL}/api/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseJson(response);
}

export async function getDashboard() {
  const response = await expoFetch(`${API_URL}/api/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson(response);
}

export async function getIncident(id) {
  const response = await expoFetch(`${API_URL}/api/incidents/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson(response);
}

export async function getIncidents() {
  const response = await expoFetch(`${API_URL}/api/incidents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson(response);
}

export async function analyzeAsset(asset) {
  const file = new File(asset.uri);
  const form = new FormData();
  form.append('file', file);
  const response = await expoFetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return parseJson(response);
}

export async function shareIncidentReport(incidentId) {
  const response = await expoFetch(`${API_URL}/api/incidents/${encodeURIComponent(incidentId)}/report`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const payload = await parseJson(response);
    throw new Error(payload.error || 'Report generation failed.');
  }
  const destination = new File(Paths.cache, `SHAKTII-${incidentId}.pdf`);
  destination.write(await response.bytes());
  if (!(await Sharing.isAvailableAsync())) return { uri: destination.uri, shared: false };
  await Sharing.shareAsync(destination.uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'SHAKTII Incident Report',
    UTI: 'com.adobe.pdf',
  });
  return { uri: destination.uri, shared: true };
}
