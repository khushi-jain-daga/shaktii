function classify(query) {
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(query)) return { type: 'IP', endpoint: `ip_addresses/${query}` };
  if (/^[a-fA-F0-9]{32,64}$/.test(query)) return { type: 'Hash', endpoint: `files/${query}` };
  return { type: 'Domain', endpoint: `domains/${query}` };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  const query = String(req.body?.query || '').trim();
  if (!query) return res.status(400).json({ success: false, error: 'Query is required' });
  const { type, endpoint } = classify(query);

  if (!process.env.VIRUSTOTAL_API_KEY) {
    const mockMalicious = type === 'Hash' ? 45 : type === 'IP' ? 12 : 0;
    return res.status(200).json({ success: true, analysis: {
      query, type, provider: 'Local fallback / VirusTotal not configured',
      summary: `External VirusTotal enrichment is not configured. Showing safe demonstration context for ${query}. Add VIRUSTOTAL_API_KEY on the server for live reputation data.`,
      stats: { malicious: mockMalicious, suspicious: mockMalicious ? 3 : 0, harmless: mockMalicious ? 5 : 48, undetected: 16 },
      reputation: mockMalicious ? -15 : 0,
      owner: type === 'IP' ? 'Unavailable without provider' : undefined,
      country: type === 'IP' ? 'Unknown' : undefined,
      network: undefined,
      meaningfulName: undefined,
      categories: mockMalicious ? ['demonstration suspicious signal'] : [],
      threatActors: mockMalicious ? ['Demo classification'] : [],
      iocs: [{ value: query, type, description: 'Local demonstration reputation context.' }],
      mitigations: mockMalicious ? [`Validate ${query} against internal telemetry before blocking.`, 'Investigate endpoints that communicated with this indicator.', 'Review DNS, proxy, identity and endpoint logs for adjacent activity.'] : ['No immediate blocking is indicated by the demonstration context.', 'Continue standard monitoring.']
    }});
  }

  try {
    const response = await fetch(`https://www.virustotal.com/api/v3/${endpoint}`, { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY, Accept: 'application/json' } });
    if (!response.ok) return res.status(response.status).json({ success: false, error: `VirusTotal request failed (${response.status})` });
    const payload = await response.json();
    const attrs = payload?.data?.attributes || {};
    const stats = attrs.last_analysis_stats || {};
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const harmless = stats.harmless || 0;
    const undetected = stats.undetected || 0;
    const categoryValues = attrs.categories && typeof attrs.categories === 'object' ? Object.values(attrs.categories).filter(Boolean) : [];
    const threatActors = attrs.popular_threat_classification?.threat_names || [];
    const analysis = {
      query, type, provider: 'VirusTotal',
      summary: `VirusTotal analysis for ${query}: ${malicious} malicious, ${suspicious} suspicious, ${harmless} harmless and ${undetected} undetected vendor verdicts.${attrs.as_owner ? ` Registered owner: ${attrs.as_owner}.` : ''}`,
      stats: { malicious, suspicious, harmless, undetected },
      reputation: attrs.reputation || 0,
      owner: attrs.as_owner || attrs.registrar || undefined,
      country: attrs.country || undefined,
      network: attrs.network || undefined,
      meaningfulName: attrs.meaningful_name || undefined,
      categories: categoryValues.slice(0, 12),
      threatActors: threatActors.slice(0, 12),
      iocs: [{ value: query, type, description: `Reputation ${attrs.reputation || 0}${attrs.meaningful_name ? ` • ${attrs.meaningful_name}` : ''}` }],
      mitigations: malicious > 0 || suspicious > 0 ? [`Validate and, if confirmed malicious, block ${query} at the relevant network control.`, `Investigate internal endpoints that recently communicated with this ${type.toLowerCase()}.`, 'Review DNS, proxy, identity and endpoint telemetry for related activity.'] : ['No immediate blocking required based on current vendor verdicts.', 'Continue standard monitoring and correlation.']
    };
    return res.status(200).json({ success: true, analysis });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Threat-intel lookup failed' });
  }
}
