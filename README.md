# SHAKTII – Autonomous Digital Defense Platform

SHAKTII is an AI-powered cybersecurity interface with an integrated **PKAP Analyzer** workspace for raw log ingestion, threat detection, incident reporting, threat intelligence, investigation, and response workflows.

> Built for a professional assignment/demo workflow: clean Vite frontend, SHAKTII-native UI, serverless PKAP APIs, and Vercel-ready deployment.

## Live Demo

```text
https://shaktii.vercel.app
```

## Repository

```text
https://github.com/khushi-jain-daga/shaktii
```

## Key Modules

- **SHAKTII Landing Page** – dark-grid product interface with security positioning.
- **Live Security Dashboard** – operational telemetry and defense overview.
- **PKAP Upload Center** – upload or paste `.log`, `.txt`, `.json`, and `.csv` data.
- **Report Dashboard** – risk score, severity breakdown, findings, IOCs, and remediation.
- **Reports History** – local report storage, reopen, and delete workflows.
- **Threat Intelligence** – IOC search, enrichment cards, activity graph, and threat tables.
- **Documentation** – product usage and workflow guidance inside the app.
- **Settings** – local behavior, compliance, notifications, and cleanup preferences.
- **Serverless APIs** – analysis, investigation, report generation, threat intel, and containment endpoints.

## Feature Highlights

- Client-side sensitive-data redaction before analysis
- Deterministic local fallback analysis
- Optional AI enrichment flow for deeper investigation
- VirusTotal-style threat-intelligence enrichment fallback
- MITRE ATT&CK style tags and investigation context
- IOC extraction from raw logs
- Responsive report and threat-activity graphs
- Markdown report export and sharing actions
- Local containment/blocklist workflow placeholder
- Vercel deployment support through `api/` serverless functions

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, custom SHAKTII design system |
| Motion | Framer Motion / Motion |
| Charts | Recharts |
| Icons | Lucide React |
| APIs | Vercel Serverless Functions |
| Deployment | Vercel |

## Project Structure

```text
shaktii/
├── api/                         # Vercel serverless API routes
│   ├── pkap-analyze.js
│   ├── pkap-block-ip.js
│   ├── pkap-generate-report.js
│   ├── pkap-investigate.js
│   └── pkap-threat-intel.js
│
├── docs/                        # Technical and handoff documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   └── SETUP.md
│
├── public/
│   └── screenshots/             # Add demo screenshots here
│       └── README.md
│
├── src/
│   ├── components/
│   │   ├── Dashboard/           # SHAKTII live dashboard
│   │   ├── PkapAnalyzer/        # PKAP Analyzer workspace pages
│   │   ├── LandingPage.tsx
│   │   └── Navbar.tsx
│   │
│   ├── utils/
│   │   └── pkapAnalyzer.ts      # Local analysis, redaction, helpers
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env.example.pkap            # Example environment variables
├── .gitignore
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts
```

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://localhost:5173
```

## Production Build

```bash
npm run build
```

## Environment Variables

Copy the example file and add only the integrations you want to use:

```bash
cp .env.example.pkap .env
```

Never commit real API keys. The app can continue using local/fallback analysis when optional external providers are not configured.

Example variables are documented in `.env.example.pkap`.

## Vercel Deployment

Import this repository into Vercel with:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

The `api/` directory is deployed as Vercel Functions alongside the frontend.

## Suggested Screenshots

Add these screenshots under `public/screenshots/` before final submission:

```text
homepage.png
pkap-upload.png
report-dashboard.png
threat-intel.png
settings.png
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Features](docs/FEATURES.md)
- [Setup Guide](docs/SETUP.md)
- [API Reference](docs/API.md)

## Security Notes

Do not commit:

- `.env`
- real API keys
- private credentials
- production logs containing sensitive data
- personal tokens or secrets

## Assignment Handoff

For reviewers or teammates:

```bash
git clone https://github.com/khushi-jain-daga/shaktii.git
cd shaktii
npm install
npm run dev
```

Then open the Vite local URL in the browser.

---

Built as the **SHAKTII + PKAP Analyzer** security workspace.
