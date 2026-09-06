function detectType(fileName, data) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.json')) return 'JSON / Structured Event Log';
  if (lower.endsWith('.csv')) return 'CSV / Event Export';
  if (/nginx|apache|http\//i.test(data)) return 'Web / Access Log';
  if (/sshd|authentication|sudo|pam_/i.test(data)) return 'Authentication / Syslog';
  if (/windows security|event id\s*46/i.test(data)) return 'Windows Security Event Log';
  return 'Syslog / Plain Text';
}

function topEntries(map, limit = 8) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, value]) => ({ label, value }));
}

export function analyzeTextLog(fileName, data) {
  const lines = String(data || '').split(/\r?\n/).filter((line) => line.trim()).slice(0, 10000);
  const findings = [];
  const iocMap = new Map();
  const protocols = new Map();
  const sources = new Map();
  const severityBreakdown = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  const timestampRegex = /\b20\d\d-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?\b/;
  let firstTime = 'Unknown';
  let lastTime = 'Unknown';

  for (const line of lines) {
    const lower = line.toLowerCase();
    const ips = line.match(ipRegex) || [];
    const sourceIP = ips[0] || 'Unknown';
    if (sourceIP !== 'Unknown') sources.set(sourceIP, (sources.get(sourceIP) || 0) + 1);
    for (const ip of ips) {
      if (!iocMap.has(ip)) iocMap.set(ip, { value: ip, type: 'IP', reputation: 'Unknown' });
    }

    const ts = line.match(timestampRegex)?.[0] || 'Unknown';
    if (ts !== 'Unknown') {
      if (firstTime === 'Unknown') firstTime = ts;
      lastTime = ts;
    }

    let severity = 'Info';
    let eventType = 'Informational Event';
    let mitreTag = 'TA0005';
    let matchedPattern = 'Baseline event';
    if (/critical|fatal|ransomware|rootkit|privilege escalation|data exfiltration/.test(lower)) {
      severity = 'Critical';
      eventType = /privilege escalation/.test(lower) ? 'Privilege Escalation Signal' : 'Critical Security Signal';
      mitreTag = 'T1548';
      matchedPattern = 'Critical compromise keyword';
    } else if (/failed password|brute force|credential stuffing|unauthorized|denied|exploit|malware/.test(lower)) {
      severity = 'High';
      eventType = /password|credential|brute force/.test(lower) ? 'Authentication Attack Signal' : 'Unauthorized / Malicious Activity';
      mitreTag = /password|credential|brute force/.test(lower) ? 'T1110' : 'T1203';
      matchedPattern = 'Repeated authentication or exploit indicator';
    } else if (/warn|warning|blocked|suspicious|anomaly|timeout|rate limit/.test(lower)) {
      severity = 'Medium';
      eventType = 'Suspicious / Anomalous Event';
      mitreTag = 'T1046';
      matchedPattern = 'Warning or anomaly indicator';
    } else if (/notice|debug/.test(lower)) {
      severity = 'Low';
      eventType = 'Low-Severity Event';
    }

    severityBreakdown[severity.toLowerCase()] += 1;
    if (severity !== 'Info' && findings.length < 120) {
      findings.push({
        severity,
        eventType,
        sourceIP,
        destinationIP: ips[1] || 'Unknown',
        timestamp: ts,
        description: line.slice(0, 240),
        rawLogSnippet: line,
        mitreTag,
        matchedPattern,
      });
      if (sourceIP !== 'Unknown') {
        const reputation = severity === 'Critical' ? 'Malicious' : severity === 'High' ? 'Suspicious' : 'Unknown';
        iocMap.set(sourceIP, { value: sourceIP, type: 'IP', reputation });
      }
    }

    if (/tcp/.test(lower)) protocols.set('TCP', (protocols.get('TCP') || 0) + 1);
    if (/udp/.test(lower)) protocols.set('UDP', (protocols.get('UDP') || 0) + 1);
    if (/http/.test(lower)) protocols.set('HTTP', (protocols.get('HTTP') || 0) + 1);
    if (/dns/.test(lower)) protocols.set('DNS', (protocols.get('DNS') || 0) + 1);
    if (/ssh|sshd/.test(lower)) protocols.set('SSH', (protocols.get('SSH') || 0) + 1);
  }

  let riskScore = 15;
  if (severityBreakdown.critical) riskScore = Math.min(99, 88 + severityBreakdown.critical * 2);
  else if (severityBreakdown.high) riskScore = Math.min(86, 62 + severityBreakdown.high * 4);
  else if (severityBreakdown.medium) riskScore = Math.min(60, 30 + severityBreakdown.medium * 3);
  const threatLevel = riskScore >= 85 ? 'CRITICAL' : riskScore >= 65 ? 'HIGH' : riskScore >= 35 ? 'MEDIUM' : 'LOW';

  return {
    fileName,
    sourceType: 'TEXT_LOG',
    executiveSummary: findings.length
      ? `SHAKTII detected ${findings.length} security-relevant event${findings.length === 1 ? '' : 's'} in ${lines.length.toLocaleString()} log lines. Prioritize the highest-severity authentication, access, and anomaly signals and correlate them with network and endpoint telemetry.`
      : `SHAKTII analyzed ${lines.length.toLocaleString()} log lines and did not identify a dominant high-risk pattern with the deterministic rules.`,
    metadata: {
      logTypeDetected: detectType(fileName, data),
      timeRangeCovered: `${firstTime} → ${lastTime}`,
      overallRiskScore: riskScore,
      threatLevel,
      packetsAnalyzed: 0,
      bytesAnalyzed: Buffer.byteLength(data),
    },
    severityBreakdown,
    findings,
    iocs: [...iocMap.values()].slice(0, 40),
    analytics: {
      protocols: topEntries(protocols, 8),
      topSourceIPs: topEntries(sources, 8),
      topDestinationIPs: [],
      topPorts: [],
      timeline: [],
    },
    remediationChecklist: findings.length
      ? [
          'Validate critical/high events against endpoint, identity, and network telemetry.',
          'Block confirmed malicious indicators and isolate affected assets when evidence supports containment.',
          'Review successful authentications immediately after repeated failures.',
          'Preserve source logs and export the SHAKTII report for incident handling.',
        ]
      : ['Continue monitoring and preserve the dataset as a clean baseline.'],
  };
}
