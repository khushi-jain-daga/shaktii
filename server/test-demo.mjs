import fs from 'node:fs';
import { analyzeCapture } from './src/captureParser.js';

const capture = fs.readFileSync(new URL('../demo/port-scan-demo.pcap', import.meta.url));
const result = analyzeCapture('port-scan-demo.pcap', capture);
const portScan = result.findings.find((item) => item.eventType.includes('Port Scan'));

if (result.metadata.packetsAnalyzed !== 40) throw new Error(`Expected 40 packets, got ${result.metadata.packetsAnalyzed}`);
if (result.metadata.threatLevel !== 'CRITICAL') throw new Error(`Expected CRITICAL, got ${result.metadata.threatLevel}`);
if (!portScan) throw new Error('Port-scan finding was not detected.');

console.log('SHAKTII demo capture verified');
console.log(`Packets: ${result.metadata.packetsAnalyzed}`);
console.log(`Threat: ${result.metadata.threatLevel}`);
console.log(`Risk: ${result.metadata.overallRiskScore}/100`);
console.log(`Finding: ${portScan.eventType} (${portScan.mitreTag})`);
