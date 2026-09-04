# SHAKTII

SHAKTII is a modern autonomous digital-defense interface with an integrated **PKAP Analyzer** workspace for security log analysis, incident reporting, threat intelligence, investigation, and response workflows.

## Highlights

- SHAKTII landing experience and live security console
- PKAP Analyzer upload center for `.log`, `.txt`, `.json`, and `.csv`
- Client-side sensitive-data redaction before analysis
- Security report dashboard with severity and event visualizations
- Reports history with reopen/delete workflows
- Threat-intelligence workspace with IOC search and responsive activity graphs
- Finding investigation and remediation workflows
- Documentation and settings pages
- Vercel serverless APIs for analysis, investigation, report generation, threat intelligence, and containment
- Optional AI and VirusTotal enrichment with local fallback behavior

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Vercel Functions

## Local development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Production build

```bash
npm run build
```

## Environment variables

Copy the example file and add only the integrations you want to use:

```bash
cp .env.example.pkap .env
```

Never commit real API keys. The application is designed to retain local/fallback analysis when optional external providers are unavailable.

## Vercel deployment

Import this repository into Vercel with:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

The `api/` directory is deployed as Vercel Functions alongside the frontend.

## Main PKAP workspace

1. **Upload Center** — ingest or paste raw logs and start analysis.
2. **Report** — inspect risk, findings, IOCs, remediation, and visual summaries.
3. **Reports History** — reopen and manage previous analyses.
4. **Threat Intel** — investigate IOCs and review responsive threat visualizations.
5. **Documentation** — product usage and workflow guidance.
6. **Settings** — local behavior, compliance, notifications, and cleanup preferences.

## Security note

Do not commit `.env` files, real credentials, production logs containing sensitive data, or private API keys to the repository.

---

Built as the SHAKTII + PKAP Analyzer security workspace.
