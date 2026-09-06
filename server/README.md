# SHAKTII Node.js Hackathon API

This is the mobile-facing Node.js API for the SHAKTII hackathon workflow. It is independent of the existing Vite/Vercel demo and can run on a laptop on the same Wi-Fi as an Expo phone.

## What works

- Demo analyst login/token
- Multipart upload of `.pcap`, `.pcapng`, `.log`, `.txt`, `.json`, `.csv`
- Classic PCAP and PCAPNG packet metadata parsing
- Ethernet + IPv4/IPv6 + TCP/UDP/ICMP extraction
- Port scan / reconnaissance detection
- SYN-flood / connection-burst detection
- DNS burst detection
- ICMP sweep/flood detection
- Suspicious remote-access port activity
- Risk score + threat level
- Protocol/source/destination/port analytics
- Optional Gemini executive-summary/remediation enrichment
- Incident list and dashboard summary for the current server session
- Real PDF incident report download

## Run

```bash
cd server
npm install
npm run test:demo
npm start
```

Default address: `http://0.0.0.0:4000`.

Health check:

```text
GET http://localhost:4000/health
```

## Demo credentials

Defaults are intentionally demo-only and can be overridden in `.env`/your shell:

```text
demo@shaktii.ai
SHAKTII2026
```

## Important prototype note

Incident history is stored in memory for the hackathon process. Restarting the server clears it. For a production build, replace `src/store.js` with Prisma/Postgres or your existing persistent backend.
