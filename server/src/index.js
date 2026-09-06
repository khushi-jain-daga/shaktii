import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { analyzeUploadedFile } from './analyzer.js';
import { clearIncidents, dashboardSummary, deleteIncident, getIncident, listIncidents, saveIncident } from './store.js';
import { writeIncidentPdf } from './reportPdf.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const demoEmail = process.env.DEMO_EMAIL || 'demo@shaktii.ai';
const demoPassword = process.env.DEMO_PASSWORD || 'SHAKTII2026';
const demoToken = process.env.DEMO_API_TOKEN || 'shaktii-hackathon-demo-token';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
});

app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'SHAKTII Node API', version: 'hackathon-v1', time: new Date().toISOString() });
});

app.post('/api/auth/demo-login', (req, res) => {
  const { email, password } = req.body || {};
  if (email !== demoEmail || password !== demoPassword) {
    return res.status(401).json({ success: false, error: 'Invalid demo credentials.' });
  }
  return res.json({ success: true, token: demoToken, user: { name: 'SHAKTII Analyst', email: demoEmail, role: 'SOC Analyst' } });
});

app.use('/api', (req, res, next) => {
  if (req.path === '/auth/demo-login') return next();
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (token !== demoToken) return res.status(401).json({ success: false, error: 'Unauthorized.' });
  return next();
});

app.get('/api/dashboard', (_req, res) => {
  res.json({ success: true, dashboard: dashboardSummary() });
});

app.get('/api/incidents', (_req, res) => {
  const incidents = listIncidents().map((item) => ({
    id: item.id,
    fileName: item.fileName,
    createdAt: item.createdAt,
    metadata: item.metadata,
    severityBreakdown: item.severityBreakdown,
  }));
  res.json({ success: true, incidents });
});

app.get('/api/incidents/:id', (req, res) => {
  const incident = getIncident(req.params.id);
  if (!incident) return res.status(404).json({ success: false, error: 'Incident not found.' });
  return res.json({ success: true, incident });
});

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Attach a file in multipart field "file".' });
  try {
    const incident = await analyzeUploadedFile(req.file);
    saveIncident(incident);
    return res.status(201).json({ success: true, incident });
  } catch (error) {
    return res.status(400).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get('/api/incidents/:id/report', (req, res) => {
  const incident = getIncident(req.params.id);
  if (!incident) return res.status(404).json({ success: false, error: 'Incident not found.' });
  return writeIncidentPdf(res, incident);
});

app.delete('/api/incidents/:id', (req, res) => {
  const removed = deleteIncident(req.params.id);
  return res.status(removed ? 200 : 404).json({ success: removed, error: removed ? undefined : 'Incident not found.' });
});

app.post('/api/demo/reset', (_req, res) => {
  clearIncidents();
  return res.json({ success: true });
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) return res.status(400).json({ success: false, error: error.message });
  console.error(error);
  return res.status(500).json({ success: false, error: 'Unexpected server error.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`SHAKTII Node API listening on http://0.0.0.0:${port}`);
});
