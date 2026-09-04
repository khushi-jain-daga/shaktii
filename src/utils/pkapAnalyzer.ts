export interface RedactionLog {
  ips: number;
  emails: number;
  creditCards: number;
  ssns: number;
  tokens: number;
  secrets: number;
  total: number;
}

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export interface Finding {
  severity: Severity;
  eventType: string;
  sourceIP: string;
  timestamp: string;
  description: string;
  rawLogSnippet: string;
  mitreTag?: string;
  matchedPattern?: string;
}

export interface IOC {
  value: string;
  type: 'IP' | 'Domain' | 'Hash' | 'User';
  reputation: 'Malicious' | 'Suspicious' | 'Unknown' | 'Clean';
}

export interface LogAnalysis {
  executiveSummary: string;
  metadata: {
    logTypeDetected: string;
    timeRangeCovered: string;
    overallRiskScore: number;
  };
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  findings: Finding[];
  iocs: IOC[];
  remediationChecklist: string[];
}

export interface PkapSettings {
  aiAssist: boolean;
  notifications: boolean;
  autoDelete: boolean;
  strictCompliance: boolean;
}

export const defaultPkapSettings: PkapSettings = {
  aiAssist: true,
  notifications: true,
  autoDelete: false,
  strictCompliance: false,
};

export function anonymizeLogData(logData: string): { redactedData: string; redactionLog: RedactionLog } {
  const log: RedactionLog = { ips: 0, emails: 0, creditCards: 0, ssns: 0, tokens: 0, secrets: 0, total: 0 };
  if (!logData) return { redactedData: '', redactionLog: log };

  let redacted = logData;
  redacted = redacted.replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, () => { log.ips += 1; return '[REDACTED_IP]'; });
  redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, () => { log.emails += 1; return '[REDACTED_EMAIL]'; });
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, () => { log.creditCards += 1; return '[REDACTED_CREDIT_CARD]'; });
  redacted = redacted.replace(/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g, () => { log.ssns += 1; return '[REDACTED_SSN]'; });
  redacted = redacted.replace(/Bearer\s+[a-zA-Z0-9\-._~+/]+=*/g, () => { log.tokens += 1; return 'Bearer [REDACTED_TOKEN]'; });
  redacted = redacted.replace(/("password"|"api_key"|"secret"|password=|api_key=|secret=)\s*[:=]\s*["']?[^"'\s&]+["']?/gi, (match, key: string) => {
    log.secrets += 1;
    return `${key}${match.includes(':') ? ':' : '='} [REDACTED_SECRET]`;
  });
  log.total = log.ips + log.emails + log.creditCards + log.ssns + log.tokens + log.secrets;
  return { redactedData: redacted, redactionLog: log };
}

function detectLogType(fileName: string, data: string) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.json')) return 'JSON / Structured Event Log';
  if (lowerName.endsWith('.csv')) return 'CSV / Event Export';
  if (/nginx|apache|http\/\d/i.test(data)) return 'Web / Access Log';
  if (/event id\s*46(?:24|25|88)|windows security/i.test(data)) return 'Windows Security Event Log';
  if (/sshd|authentication|sudo|pam_/i.test(data)) return 'Authentication / Syslog';
  if (/kernel|ebpf|syscall/i.test(data)) return 'Kernel / Runtime Log';
  return 'Syslog / Plain Text';
}

export function analyzeLogHeuristically(fileName: string, data: string, strictCompliance = false): LogAnalysis {
  const sourceLines = data.split('\n').filter((line) => line.trim().length > 0);
  const lines = sourceLines.length > 5000
    ? [...sourceLines.slice(0, 2500), ...sourceLines.slice(-2500)]
    : sourceLines;
  const severityBreakdown = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const findings: Finding[] = [];
  const iocsMap = new Map<string, IOC>();
  const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
  const timeRegex = /\b(?:[0-2][0-9]:[0-5][0-9]:[0-5][0-9])|(?:20\d\d-[0-1]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?)\b/;
  const hashRegex = /\b[a-fA-F0-9]{32,64}\b/g;
  const domainRegex = /\b(?:[a-zA-Z0-9-]+\.)+(?:com|net|org|io|dev|ru|cn|xyz|top|info|in|ai)\b/g;
  const userRegex = /(?:user(?:name)?[=:]\s*|for\s+)([a-zA-Z0-9._-]{3,32})/i;

  let firstTime = 'Unknown';
  let lastTime = 'Unknown';

  lines.forEach((line) => {
    const lower = line.toLowerCase();
    let severity: Severity = 'Info';
    if (['fatal', 'critical', 'panic', 'emerg', 'ransomware', 'rootkit', 'privilege escalation', 'data exfiltration'].some((word) => lower.includes(word))) {
      severity = 'Critical'; severityBreakdown.critical += 1;
    } else if (['error', 'failed', 'denied', 'unauthorized', 'refused', 'brute force', 'exploit', 'malware', 'credential stuffing'].some((word) => lower.includes(word))) {
      severity = 'High'; severityBreakdown.high += 1;
    } else if (['warn', 'warning', 'timeout', 'blocked', 'suspicious', 'anomaly', 'rate limit'].some((word) => lower.includes(word))) {
      severity = 'Medium'; severityBreakdown.medium += 1;
    } else if (['notice', 'debug'].some((word) => lower.includes(word))) {
      severity = 'Low'; severityBreakdown.low += 1;
    } else {
      severityBreakdown.info += 1;
    }

    const timestamp = line.match(timeRegex)?.[0] ?? 'Unknown';
    if (timestamp !== 'Unknown') {
      if (firstTime === 'Unknown') firstTime = timestamp;
      lastTime = timestamp;
    }

    const ips = line.match(ipRegex) ?? [];
    const sourceIP = ips[0] ?? 'Unknown';
    ips.forEach((ip) => {
      const reputation: IOC['reputation'] = severity === 'Critical' ? 'Malicious' : severity === 'High' ? 'Suspicious' : 'Unknown';
      const existing = iocsMap.get(ip);
      if (!existing || reputation === 'Malicious' || (reputation === 'Suspicious' && existing.reputation === 'Unknown')) {
        iocsMap.set(ip, { value: ip, type: 'IP', reputation });
      }
    });
    (line.match(hashRegex) ?? []).slice(0, 2).forEach((hash) => iocsMap.set(hash, { value: hash, type: 'Hash', reputation: severity === 'Info' ? 'Unknown' : 'Suspicious' }));
    (line.match(domainRegex) ?? []).slice(0, 2).forEach((domain) => iocsMap.set(domain, { value: domain, type: 'Domain', reputation: severity === 'Info' ? 'Unknown' : 'Suspicious' }));
    const user = line.match(userRegex)?.[1];
    if (user && !iocsMap.has(user)) iocsMap.set(user, { value: user, type: 'User', reputation: severity === 'Critical' || severity === 'High' ? 'Suspicious' : 'Unknown' });

    if (severity === 'Critical' || severity === 'High' || severity === 'Medium') {
      if (findings.length >= 100) return;
      let eventType = 'Anomalous Event';
      let mitreTag = 'TA0005';
      let matchedPattern = 'Anomaly / warning signal';
      if (/login|auth|credential|password|sshd/.test(lower)) { eventType = 'Authentication Anomaly'; mitreTag = 'T1110'; matchedPattern = 'Credential / authentication failure'; }
      else if (/denied|forbidden|permission/.test(lower)) { eventType = 'Access Denied'; mitreTag = 'T1548'; matchedPattern = 'Unauthorized access / privilege control'; }
      else if (/timeout|connection|refused/.test(lower)) { eventType = 'Network / Service Failure'; mitreTag = 'T1046'; matchedPattern = 'Network service disruption'; }
      else if (/powershell|cmd\.exe|shell|exec/.test(lower)) { eventType = 'Command Execution'; mitreTag = 'T1059'; matchedPattern = 'Command interpreter / execution'; }
      else if (/malware|ransomware|trojan|rootkit/.test(lower)) { eventType = 'Malicious Payload Signal'; mitreTag = 'T1204'; matchedPattern = 'Malware / malicious payload keyword'; }
      else if (/exfil|upload|egress|large outbound/.test(lower)) { eventType = 'Possible Exfiltration'; mitreTag = 'T1041'; matchedPattern = 'Unusual outbound transfer'; }

      findings.push({ severity, eventType, sourceIP, timestamp, description: line.slice(0, 210) + (line.length > 210 ? '…' : ''), rawLogSnippet: line, mitreTag, matchedPattern });
    }
  });

  const rank: Record<Severity, number> = { Critical: 5, High: 4, Medium: 3, Low: 2, Info: 1 };
  findings.sort((a, b) => rank[b.severity] - rank[a.severity]);

  let riskScore = 15;
  if (severityBreakdown.critical > 0) riskScore = Math.min(100, 90 + severityBreakdown.critical);
  else if (severityBreakdown.high > 5) riskScore = Math.min(90, 75 + severityBreakdown.high);
  else if (severityBreakdown.high > 0) riskScore = Math.min(78, 60 + severityBreakdown.high * 2);
  else if (severityBreakdown.medium > 10) riskScore = Math.min(60, 40 + severityBreakdown.medium);
  else if (severityBreakdown.medium > 0) riskScore = 30 + Math.min(18, severityBreakdown.medium * 2);
  if (strictCompliance && (severityBreakdown.high > 0 || severityBreakdown.critical > 0)) riskScore = Math.max(riskScore, 75);

  const risky = riskScore >= 60;
  return {
    executiveSummary: risky
      ? 'Pkap Analyzer identified elevated security activity in this dataset. High-impact authentication, access, execution, or service-failure signals were observed and correlated with extracted indicators. Prioritize the highest-severity findings, validate affected endpoints, and contain confirmed malicious indicators before normal operations resume.'
      : 'The analyzed dataset is close to a normal operational baseline. No dominant critical pattern was detected, though lower-severity anomalies should remain under observation and be correlated with endpoint and network telemetry.',
    metadata: {
      logTypeDetected: detectLogType(fileName, data),
      timeRangeCovered: `${firstTime} → ${lastTime}`,
      overallRiskScore: riskScore,
    },
    severityBreakdown,
    findings,
    iocs: Array.from(iocsMap.values()).slice(0, 50),
    remediationChecklist: risky
      ? [
          'Validate the top critical/high findings against endpoint and network telemetry.',
          'Block or isolate confirmed malicious indicators at network enforcement points.',
          'Review authentication success events immediately after repeated failures.',
          'Preserve the source log and incident timeline for forensic follow-up.',
          'Rotate exposed credentials or tokens associated with suspicious events.',
        ]
      : [
          'Continue monitoring for increased anomaly frequency.',
          'Correlate medium-severity events with network and endpoint telemetry.',
          'Retain the source log for baseline comparison.',
        ],
  };
}

export function buildMarkdownReport(fileName: string, analysis: LogAnalysis, redaction: RedactionLog) {
  const severity = analysis.severityBreakdown;
  const rows = analysis.findings.slice(0, 35).map((item) => `| ${item.severity} | ${item.eventType} | ${item.sourceIP} | ${item.timestamp} | ${item.mitreTag || '-'} |`).join('\n');
  const evidence = analysis.findings.filter((item) => item.severity === 'Critical' || item.severity === 'High').slice(0, 8).map((item, index) => `### Evidence ${index + 1} — ${item.eventType}\n\n\`\`\`text\n${item.rawLogSnippet}\n\`\`\``).join('\n\n') || 'No high-severity evidence snippets were identified.';
  const iocs = analysis.iocs.map((ioc) => `- \`${ioc.value}\` — ${ioc.type} — ${ioc.reputation}`).join('\n') || '- None extracted';
  const remediation = analysis.remediationChecklist.map((item, index) => `${index + 1}. ${item}`).join('\n');
  const ticketId = `PKAP-${new Date().getFullYear()}-${Math.abs(fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 9000 + 1000)}`;
  return `# SHAKTII / Pkap Analyzer Incident Report\n\n**Ticket:** ${ticketId}\n\n**Date:** ${new Date().toISOString()}\n\n**File:** ${fileName}\n\n**Risk Score:** ${analysis.metadata.overallRiskScore}/100\n\n**Detected Type:** ${analysis.metadata.logTypeDetected}\n\n**Time Range:** ${analysis.metadata.timeRangeCovered}\n\n## Executive Summary\n${analysis.executiveSummary}\n\n## Incident Overview\nThe source file was normalized, privacy-filtered, scored, and correlated with extracted security indicators. ${redaction.total} sensitive values were redacted before optional external AI processing.\n\n## Severity Matrix\n| Severity | Count | Interpretation |\n| --- | ---: | --- |\n| Critical | ${severity.critical} | Immediate threat / breach signal |\n| High | ${severity.high} | Severe anomaly / unauthorized activity |\n| Medium | ${severity.medium} | Suspicious event / warning |\n| Low | ${severity.low} | Minor deviation |\n| Info | ${severity.info} | Baseline event |\n\n## Timeline / Findings\n| Severity | Event | Source | Time | MITRE |\n| --- | --- | --- | --- | --- |\n${rows || '| - | No anomalous finding | - | - | - |'}\n\n## Technical Evidence\n${evidence}\n\n## Indicators of Compromise\n${iocs}\n\n## Recommended Actions\n${remediation}\n\n## Conclusion\n${analysis.metadata.overallRiskScore >= 60 ? 'Immediate analyst review and containment are recommended.' : 'No immediate lockdown is indicated; continue monitoring and correlation.'}\n\n---\nGenerated by SHAKTII Pkap Analyzer.\n`;
}
