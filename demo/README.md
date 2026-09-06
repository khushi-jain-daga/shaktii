# SHAKTII Hackathon Demo Capture

`port-scan-demo.pcap` is a small deterministic Ethernet/IPv4/TCP capture created for the live SHAKTII demo.

Expected result with `server/src/captureParser.js`:

- 40 packets analyzed
- Threat level: `CRITICAL`
- Risk score: `91/100`
- Finding: `Port Scan / Reconnaissance`
- MITRE-style mapping: `T1046`
- Source: `192.168.1.50`
- Destination: `10.0.0.5`
- Destination ports: 20 through 59

It contains synthetic traffic only and no real user data.
