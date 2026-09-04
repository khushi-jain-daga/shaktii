# Architecture

SHAKTII is structured as a Vite + React single-page application with a Vercel serverless API layer.

## High-Level Flow

```text
User
  ↓
React + Vite Frontend
  ↓
PKAP Analyzer Workspace
  ↓
Local redaction + deterministic analysis
  ↓
Optional Vercel API enrichment
  ↓
Report, history, threat intel, and remediation views
```

## Frontend Layer

The frontend is located inside `src/`.

```text
src/
├── App.tsx
├── main.tsx
├── index.css
├── components/
│   ├── Dashboard/
│   ├── PkapAnalyzer/
│   ├── LandingPage.tsx
│   └── Navbar.tsx
└── utils/
    └── pkapAnalyzer.ts
```

### Main Responsibilities

- Render the SHAKTII landing experience.
- Provide navigation between the landing page, dashboard, and PKAP Analyzer workspace.
- Keep the PKAP Analyzer UI aligned with the SHAKTII design system.
- Process uploaded or pasted log data.
- Redact sensitive data before analysis.
- Render report charts and threat-intelligence graphs.

## PKAP Analyzer Workspace

The PKAP Analyzer workspace contains six major screens:

1. Upload Center
2. Report Dashboard
3. Reports History
4. Threat Intelligence
5. Documentation
6. Settings

These screens are implemented under:

```text
src/components/PkapAnalyzer/
```

## Utility Layer

`src/utils/pkapAnalyzer.ts` contains shared helper logic such as:

- local log parsing
- sensitive data redaction
- risk scoring helpers
- IOC extraction
- fallback analysis data shaping

## API Layer

The `api/` directory contains Vercel serverless functions.

```text
api/
├── pkap-analyze.js
├── pkap-block-ip.js
├── pkap-generate-report.js
├── pkap-investigate.js
└── pkap-threat-intel.js
```

### API Responsibilities

- Accept sanitized log payloads.
- Generate enriched analysis when external providers are configured.
- Produce report content.
- Investigate findings.
- Enrich IOCs through threat-intelligence flows.
- Simulate containment actions safely.

## Deployment Architecture

```text
GitHub Repository
  ↓
Vercel Build
  ↓
Static frontend served from dist/
  +
Serverless API functions from api/
```

## Security Design

- Sensitive values are redacted before analysis when possible.
- Real `.env` files should never be committed.
- Optional provider keys are read from environment variables.
- Local fallback behavior allows the app to run without external keys.
