function readIPv4(buffer, offset) {
  return `${buffer[offset]}.${buffer[offset + 1]}.${buffer[offset + 2]}.${buffer[offset + 3]}`;
}

function readIPv6(buffer, offset) {
  const groups = [];
  for (let i = 0; i < 16; i += 2) groups.push(buffer.readUInt16BE(offset + i).toString(16));
  return groups.join(':').replace(/(?:^|:)0(?::0)+(?::|$)/, '::');
}

function safeIso(seconds, micros = 0) {
  if (!Number.isFinite(seconds)) return 'Unknown';
  const date = new Date(seconds * 1000 + Math.floor(micros / 1000));
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toISOString();
}

function parseTransport(packet, offset, protocol, base) {
  if (protocol === 6 && packet.length >= offset + 20) {
    const srcPort = packet.readUInt16BE(offset);
    const dstPort = packet.readUInt16BE(offset + 2);
    const flags = packet[offset + 13];
    return {
      ...base,
      protocol: 'TCP',
      srcPort,
      dstPort,
      tcp: {
        syn: Boolean(flags & 0x02),
        ack: Boolean(flags & 0x10),
        rst: Boolean(flags & 0x04),
        fin: Boolean(flags & 0x01),
      },
    };
  }
  if (protocol === 17 && packet.length >= offset + 8) {
    return {
      ...base,
      protocol: 'UDP',
      srcPort: packet.readUInt16BE(offset),
      dstPort: packet.readUInt16BE(offset + 2),
    };
  }
  if (protocol === 1) return { ...base, protocol: 'ICMP' };
  if (protocol === 58) return { ...base, protocol: 'ICMPv6' };
  return { ...base, protocol: `IP-${protocol}` };
}

function parseEthernetFrame(packet, timestamp, wireLength = packet.length) {
  if (!Buffer.isBuffer(packet) || packet.length < 14) return null;
  let etherType = packet.readUInt16BE(12);
  let offset = 14;
  if (etherType === 0x8100 || etherType === 0x88a8) {
    if (packet.length < 18) return null;
    etherType = packet.readUInt16BE(16);
    offset = 18;
  }

  if (etherType === 0x0800) {
    if (packet.length < offset + 20) return null;
    const versionIhl = packet[offset];
    if ((versionIhl >> 4) !== 4) return null;
    const ihl = (versionIhl & 0x0f) * 4;
    if (ihl < 20 || packet.length < offset + ihl) return null;
    const protocol = packet[offset + 9];
    const base = {
      timestamp,
      length: wireLength,
      srcIP: readIPv4(packet, offset + 12),
      dstIP: readIPv4(packet, offset + 16),
      ipVersion: 4,
    };
    return parseTransport(packet, offset + ihl, protocol, base);
  }

  if (etherType === 0x86dd) {
    if (packet.length < offset + 40) return null;
    const protocol = packet[offset + 6];
    const base = {
      timestamp,
      length: wireLength,
      srcIP: readIPv6(packet, offset + 8),
      dstIP: readIPv6(packet, offset + 24),
      ipVersion: 6,
    };
    return parseTransport(packet, offset + 40, protocol, base);
  }

  return null;
}

function detectPcapEndianness(buffer) {
  if (buffer.length < 24) throw new Error('PCAP file is too small.');
  const magicLE = buffer.readUInt32LE(0);
  const magicBE = buffer.readUInt32BE(0);
  if (magicLE === 0xa1b2c3d4) return { little: true, nano: false };
  if (magicLE === 0xa1b23c4d) return { little: true, nano: true };
  if (magicBE === 0xa1b2c3d4) return { little: false, nano: false };
  if (magicBE === 0xa1b23c4d) return { little: false, nano: true };
  throw new Error('Unsupported PCAP magic number.');
}

function parseClassicPcap(buffer) {
  const { little, nano } = detectPcapEndianness(buffer);
  const read32 = (offset) => (little ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset));
  const linkType = read32(20);
  if (linkType !== 1) throw new Error(`Unsupported PCAP link type ${linkType}. Ethernet captures are supported.`);

  let offset = 24;
  const packets = [];
  let packetCount = 0;
  let byteCount = 0;
  let firstTimestamp = null;
  let lastTimestamp = null;

  while (offset + 16 <= buffer.length) {
    const tsSec = read32(offset);
    const tsFraction = read32(offset + 4);
    const inclLen = read32(offset + 8);
    const origLen = read32(offset + 12);
    offset += 16;
    if (inclLen > 16 * 1024 * 1024 || offset + inclLen > buffer.length) break;
    const timestamp = safeIso(tsSec, nano ? Math.floor(tsFraction / 1000) : tsFraction);
    const frame = buffer.subarray(offset, offset + inclLen);
    const parsed = parseEthernetFrame(frame, timestamp, origLen || inclLen);
    packetCount += 1;
    byteCount += origLen || inclLen;
    if (firstTimestamp === null) firstTimestamp = timestamp;
    lastTimestamp = timestamp;
    if (parsed && packets.length < 25000) packets.push(parsed);
    offset += inclLen;
  }

  return {
    format: 'PCAP',
    packetCount,
    byteCount,
    firstTimestamp: firstTimestamp || 'Unknown',
    lastTimestamp: lastTimestamp || 'Unknown',
    packets,
  };
}

function getPcapngEndian(buffer) {
  if (buffer.length < 12 || buffer.readUInt32BE(0) !== 0x0a0d0d0a) throw new Error('Invalid PCAPNG section header.');
  if (buffer.readUInt32LE(8) === 0x1a2b3c4d) return 'LE';
  if (buffer.readUInt32BE(8) === 0x1a2b3c4d) return 'BE';
  throw new Error('Unsupported PCAPNG byte order.');
}

function parsePcapng(buffer) {
  const endian = getPcapngEndian(buffer);
  const read32 = (offset) => (endian === 'LE' ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset));
  const read16 = (offset) => (endian === 'LE' ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset));
  const interfaces = [];
  const packets = [];
  let packetCount = 0;
  let byteCount = 0;
  let firstTimestamp = null;
  let lastTimestamp = null;
  let offset = 0;

  while (offset + 12 <= buffer.length) {
    const blockType = read32(offset);
    const totalLength = read32(offset + 4);
    if (totalLength < 12 || offset + totalLength > buffer.length) break;

    if (blockType === 0x00000001 && totalLength >= 20) {
      interfaces.push({ linkType: read16(offset + 8), timestampResolution: 1e-6 });
    }

    if (blockType === 0x00000006 && totalLength >= 32) {
      const interfaceId = read32(offset + 8);
      const high = read32(offset + 12);
      const low = read32(offset + 16);
      const capturedLength = read32(offset + 20);
      const originalLength = read32(offset + 24);
      const dataOffset = offset + 28;
      const iface = interfaces[interfaceId] || { linkType: 1, timestampResolution: 1e-6 };
      if (dataOffset + capturedLength <= offset + totalLength - 4) {
        const ticks = Number((BigInt(high) << 32n) | BigInt(low));
        const seconds = ticks * iface.timestampResolution;
        const timestamp = Number.isFinite(seconds) ? new Date(seconds * 1000).toISOString() : 'Unknown';
        const frame = buffer.subarray(dataOffset, dataOffset + capturedLength);
        packetCount += 1;
        byteCount += originalLength || capturedLength;
        if (firstTimestamp === null) firstTimestamp = timestamp;
        lastTimestamp = timestamp;
        if (iface.linkType === 1 && packets.length < 25000) {
          const parsed = parseEthernetFrame(frame, timestamp, originalLength || capturedLength);
          if (parsed) packets.push(parsed);
        }
      }
    }

    if (blockType === 0x00000003 && totalLength >= 20) {
      const originalLength = read32(offset + 8);
      const dataOffset = offset + 12;
      const capturedLength = Math.min(originalLength, totalLength - 16);
      const frame = buffer.subarray(dataOffset, dataOffset + capturedLength);
      packetCount += 1;
      byteCount += originalLength || capturedLength;
      const timestamp = 'Unknown';
      if (firstTimestamp === null) firstTimestamp = timestamp;
      lastTimestamp = timestamp;
      if ((interfaces[0]?.linkType ?? 1) === 1 && packets.length < 25000) {
        const parsed = parseEthernetFrame(frame, timestamp, originalLength || capturedLength);
        if (parsed) packets.push(parsed);
      }
    }

    offset += totalLength;
  }

  return {
    format: 'PCAPNG',
    packetCount,
    byteCount,
    firstTimestamp: firstTimestamp || 'Unknown',
    lastTimestamp: lastTimestamp || 'Unknown',
    packets,
  };
}

function topEntries(map, limit = 8) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function addFinding(findings, severity, eventType, sourceIP, description, mitreTag, matchedPattern, destinationIP = '') {
  findings.push({
    severity,
    eventType,
    sourceIP: sourceIP || 'Unknown',
    destinationIP: destinationIP || 'Unknown',
    timestamp: new Date().toISOString(),
    description,
    mitreTag,
    matchedPattern,
  });
}

function isPublicIp(ip) {
  if (!ip || ip.includes(':')) return true;
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return false;
  if (parts[0] === 10 || parts[0] === 127) return false;
  if (parts[0] === 192 && parts[1] === 168) return false;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
  if (parts[0] === 169 && parts[1] === 254) return false;
  return true;
}

export function analyzeCapture(fileName, buffer) {
  const lower = fileName.toLowerCase();
  const parsed = lower.endsWith('.pcapng') || buffer.readUInt32BE(0) === 0x0a0d0d0a
    ? parsePcapng(buffer)
    : parseClassicPcap(buffer);

  const protocolCounts = new Map();
  const sourceCounts = new Map();
  const destinationCounts = new Map();
  const portCounts = new Map();
  const sourceDistinctPorts = new Map();
  const sourceSynCounts = new Map();
  const destinationSynCounts = new Map();
  const sourceDnsCounts = new Map();
  const sourceIcmpCounts = new Map();
  const sourceRemoteAccessCounts = new Map();
  const packetsPerMinute = new Map();
  const suspiciousPorts = new Set([23, 2323, 3389, 4444, 5900, 31337]);

  for (const packet of parsed.packets) {
    protocolCounts.set(packet.protocol, (protocolCounts.get(packet.protocol) || 0) + 1);
    sourceCounts.set(packet.srcIP, (sourceCounts.get(packet.srcIP) || 0) + 1);
    destinationCounts.set(packet.dstIP, (destinationCounts.get(packet.dstIP) || 0) + 1);
    if (packet.dstPort) portCounts.set(String(packet.dstPort), (portCounts.get(String(packet.dstPort)) || 0) + 1);
    if (packet.srcIP && packet.dstPort) {
      if (!sourceDistinctPorts.has(packet.srcIP)) sourceDistinctPorts.set(packet.srcIP, new Set());
      sourceDistinctPorts.get(packet.srcIP).add(packet.dstPort);
    }
    if (packet.protocol === 'TCP' && packet.tcp?.syn && !packet.tcp?.ack) {
      sourceSynCounts.set(packet.srcIP, (sourceSynCounts.get(packet.srcIP) || 0) + 1);
      destinationSynCounts.set(packet.dstIP, (destinationSynCounts.get(packet.dstIP) || 0) + 1);
    }
    if (packet.protocol === 'UDP' && packet.dstPort === 53) sourceDnsCounts.set(packet.srcIP, (sourceDnsCounts.get(packet.srcIP) || 0) + 1);
    if (packet.protocol === 'ICMP' || packet.protocol === 'ICMPv6') sourceIcmpCounts.set(packet.srcIP, (sourceIcmpCounts.get(packet.srcIP) || 0) + 1);
    if (packet.dstPort && suspiciousPorts.has(packet.dstPort)) sourceRemoteAccessCounts.set(packet.srcIP, (sourceRemoteAccessCounts.get(packet.srcIP) || 0) + 1);
    if (packet.timestamp && packet.timestamp !== 'Unknown') {
      const minute = packet.timestamp.slice(0, 16) + ':00Z';
      packetsPerMinute.set(minute, (packetsPerMinute.get(minute) || 0) + 1);
    }
  }

  const findings = [];
  for (const [source, ports] of sourceDistinctPorts) {
    if (ports.size >= 12) {
      const severity = ports.size >= 30 ? 'Critical' : 'High';
      addFinding(findings, severity, 'Port Scan / Reconnaissance', source, `${source} contacted ${ports.size} distinct destination ports in this capture, consistent with active service discovery or scanning.`, 'T1046', 'Many destination ports from one source');
    }
  }

  for (const [source, count] of sourceSynCounts) {
    if (count >= 80) {
      addFinding(findings, count >= 250 ? 'Critical' : 'High', 'SYN Flood / Connection Burst', source, `${source} generated ${count} TCP SYN packets without ACK in the analyzed sample.`, 'T1498', 'High volume of SYN packets');
    }
  }

  for (const [destination, count] of destinationSynCounts) {
    if (count >= 200) {
      addFinding(findings, count >= 600 ? 'Critical' : 'High', 'Targeted Connection Flood', 'Multiple sources', `${destination} received ${count} SYN requests, indicating a possible connection flood or coordinated scan.`, 'T1498', 'High inbound SYN concentration', destination);
    }
  }

  for (const [source, count] of sourceDnsCounts) {
    if (count >= 120) {
      addFinding(findings, 'Medium', 'DNS Query Burst', source, `${source} generated ${count} DNS requests in the capture. Review for tunneling, beaconing, or automated discovery.`, 'T1071.004', 'Unusually high DNS request volume');
    }
  }

  for (const [source, count] of sourceIcmpCounts) {
    if (count >= 120) {
      addFinding(findings, 'High', 'ICMP Flood / Sweep', source, `${source} generated ${count} ICMP packets, consistent with a ping sweep or flooding behavior.`, 'T1018', 'High ICMP packet volume');
    }
  }

  for (const [source, count] of sourceRemoteAccessCounts) {
    if (count >= 6) {
      addFinding(findings, 'Medium', 'Suspicious Remote-Access Port Activity', source, `${source} repeatedly contacted high-risk or remote-access ports (${count} observed packets).`, 'T1021', 'Traffic to remote-access or commonly abused ports');
    }
  }

  const maxSource = topEntries(sourceCounts, 1)[0];
  if (maxSource && maxSource.value >= Math.max(500, parsed.packetCount * 0.65)) {
    addFinding(findings, 'Medium', 'Traffic Concentration Anomaly', maxSource.label, `${maxSource.label} generated ${maxSource.value} packets, an unusually large share of the capture.`, 'T1498', 'Single-source traffic concentration');
  }

  const severityBreakdown = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const finding of findings) severityBreakdown[finding.severity.toLowerCase()] += 1;

  let riskScore = 18;
  if (severityBreakdown.critical) riskScore = Math.min(99, 88 + severityBreakdown.critical * 3 + severityBreakdown.high * 2);
  else if (severityBreakdown.high) riskScore = Math.min(86, 66 + severityBreakdown.high * 6 + severityBreakdown.medium * 2);
  else if (severityBreakdown.medium) riskScore = Math.min(62, 38 + severityBreakdown.medium * 6);
  const threatLevel = riskScore >= 85 ? 'CRITICAL' : riskScore >= 65 ? 'HIGH' : riskScore >= 35 ? 'MEDIUM' : 'LOW';

  const iocMap = new Map();
  for (const finding of findings) {
    for (const value of [finding.sourceIP, finding.destinationIP]) {
      if (!value || value === 'Unknown' || value === 'Multiple sources') continue;
      const reputation = finding.severity === 'Critical' ? 'Malicious' : finding.severity === 'High' ? 'Suspicious' : 'Unknown';
      const key = `IP:${value}`;
      if (!iocMap.has(key) || reputation === 'Malicious') iocMap.set(key, { value, type: 'IP', reputation, public: isPublicIp(value) });
    }
  }

  const topPorts = topEntries(portCounts, 8).map((item) => ({ label: `Port ${item.label}`, value: item.value }));
  const timeline = [...packetsPerMinute.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-30).map(([label, value]) => ({ label, value }));

  return {
    fileName,
    sourceType: parsed.format,
    executiveSummary: findings.length
      ? `SHAKTII detected ${findings.length} suspicious network behavior pattern${findings.length === 1 ? '' : 's'} in ${parsed.packetCount.toLocaleString()} captured packets. The strongest signals are ${findings.slice(0, 2).map((f) => f.eventType.toLowerCase()).join(' and ')}. Validate the listed endpoints and preserve the capture for incident response.`
      : `SHAKTII analyzed ${parsed.packetCount.toLocaleString()} captured packets and did not identify a dominant attack pattern with the current deterministic rules. Continue correlation with endpoint, authentication, and threat-intelligence telemetry.`,
    metadata: {
      logTypeDetected: `${parsed.format} Network Capture`,
      timeRangeCovered: `${parsed.firstTimestamp} → ${parsed.lastTimestamp}`,
      overallRiskScore: riskScore,
      threatLevel,
      packetsAnalyzed: parsed.packetCount,
      bytesAnalyzed: parsed.byteCount,
    },
    severityBreakdown,
    findings,
    iocs: [...iocMap.values()].slice(0, 40),
    analytics: {
      protocols: topEntries(protocolCounts, 8),
      topSourceIPs: topEntries(sourceCounts, 8),
      topDestinationIPs: topEntries(destinationCounts, 8),
      topPorts,
      timeline,
    },
    remediationChecklist: findings.length
      ? [
          'Validate the highest-severity source and destination IPs against firewall, EDR, and authentication telemetry.',
          'Block or rate-limit confirmed malicious sources at the nearest enforcement point.',
          'Review exposed services and close unnecessary remote-access or management ports.',
          'Preserve the original packet capture and export the SHAKTII incident report for forensic evidence.',
          'Correlate the event window with identity, endpoint, DNS, and cloud audit logs.',
        ]
      : [
          'Retain this capture as a baseline and correlate it with endpoint and identity logs.',
          'Continue monitoring for port-scan, SYN-flood, DNS-burst, and remote-access anomalies.',
        ],
  };
}
