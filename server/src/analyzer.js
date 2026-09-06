import crypto from 'node:crypto';
import { analyzeCapture } from './captureParser.js';
import { analyzeTextLog } from './textAnalyzer.js';

const CAPTURE_EXTENSIONS = ['.pcap', '.pcapng'];
const TEXT_EXTENSIONS = ['.log', '.txt', '.json', '.csv'];

function extensionOf(name = '') {
  const lower = name.toLowerCase();
  return [...CAPTURE_EXTENSIONS, ...TEXT_EXTENSIONS].find((ext) => lower.endsWith(ext)) || '';
}

function makeIncidentId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `SHAK-${date}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

async function enrichWithGemini(result) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ...result, aiProvider: 'SHAKTII deterministic engine' };

  const compact = {
    fileName: result.fileName,
    metadata: result.metadata,
    severityBreakdown: result.severityBreakdown,
    findings: result.findings.slice(0, 12).map(({ rawLogSnippet, ...finding }) => finding),
    analytics: {
      protocols: result.analytics?.protocols?.slice(0, 6),
      topSourceIPs: result.analytics?.topSourceIPs?.slice(0, 6),
      topPorts: result.analytics?.topPorts?.slice(0, 6),
    },
  };

  const prompt = `You are SHAKTII, a defensive SOC assistant. Using ONLY this structured deterministic analysis, return valid JSON with exactly two keys: executiveSummary (2-4 concise sentences) and remediationChecklist (3-6 concrete defensive actions). Do not invent malware, attribution, compromise, CVEs, or IOC reputation.\n\n${JSON.stringify(compact)}`;
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(18000),
    });
    if (!response.ok) throw new Error(`Gemini ${response.status}`);
    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(text);
    return {
      ...result,
      executiveSummary: typeof parsed.executiveSummary === 'string' ? parsed.executiveSummary : result.executiveSummary,
      remediationChecklist: Array.isArray(parsed.remediationChecklist) && parsed.remediationChecklist.length ? parsed.remediationChecklist : result.remediationChecklist,
      aiProvider: 'Gemini 2.5 Flash + SHAKTII deterministic engine',
    };
  } catch (error) {
    return {
      ...result,
      aiProvider: 'SHAKTII deterministic engine',
      aiWarning: `AI enrichment unavailable: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function analyzeUploadedFile(file) {
  if (!file?.buffer || !file?.originalname) throw new Error('No uploaded file was received.');
  const ext = extensionOf(file.originalname);
  if (!ext) throw new Error('Unsupported file. Use .pcap, .pcapng, .log, .txt, .json, or .csv.');

  const base = CAPTURE_EXTENSIONS.includes(ext)
    ? analyzeCapture(file.originalname, file.buffer)
    : analyzeTextLog(file.originalname, file.buffer.toString('utf8'));

  const enriched = await enrichWithGemini(base);
  return {
    id: makeIncidentId(),
    createdAt: new Date().toISOString(),
    originalFile: {
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype || 'application/octet-stream',
    },
    ...enriched,
  };
}
