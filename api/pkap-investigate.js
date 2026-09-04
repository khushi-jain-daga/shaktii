export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  const issue = req.body?.issue || req.body?.finding;
  if (!issue) return res.status(400).json({ success: false, error: 'Issue is required' });

  const issueText = typeof issue === 'string' ? issue : JSON.stringify(issue);
  const fallback = `### Threat Context\n${issueText}\n\n### Potential Impact\nIf this event is unauthorized it may represent credential abuse, privilege misuse, malicious execution, or service disruption. Confirm the affected identity, asset, and surrounding timeline before declaring compromise.\n\n### Immediate Remediation\n1. Correlate the event with endpoint, network, DNS/proxy, and authentication telemetry.\n2. Contain the source indicator or affected account only after validation.\n3. Preserve raw evidence and review adjacent events for successful follow-on activity.`;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(200).json({ success: true, markdown: fallback, providerUsed: 'Local fallback' });
  }

  const prompt = `You are an expert Tier 3 SOC analyst. Investigate this privacy-safe security finding:\n\n${issueText}\n\nReturn concise Markdown with exactly these headings:\n### Threat Context\n### Potential Impact\n### Immediate Remediation\nDo not claim compromise, attribution, or malware family without evidence.`;
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1 } }),
    });
    if (!response.ok) return res.status(200).json({ success: true, markdown: fallback, providerUsed: 'Local fallback' });
    const payload = await response.json();
    const markdown = payload?.candidates?.[0]?.content?.parts?.[0]?.text || fallback;
    return res.status(200).json({ success: true, markdown, providerUsed: 'Gemini' });
  } catch {
    return res.status(200).json({ success: true, markdown: fallback, providerUsed: 'Local fallback' });
  }
}
