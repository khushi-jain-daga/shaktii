# SHAKTII ↔ WIDRS-X integration

The SHAKTII frontend is wired to the uploaded Flask WIDRS-X backend.

## Connected endpoints

- `GET /health` → dashboard backend status and counts
- `GET /traffic` → recent packet activity and protocol distribution
- `GET /logs` → live event/forensic logs with severity/search filtering
- `GET /alerts` → alert totals and severity summary
- `GET /graph` → live topology nodes/edges and node metadata
- `GET /devices` → available through the shared API client for future UI use

## Frontend configuration

Copy `.env.example.widrsx` to `.env.local` if needed:

```env
VITE_WIDRSX_API_URL=http://localhost:5000
```

If the variable is omitted, the frontend defaults to `http://localhost:5000`.

## Backend startup

From the uploaded `TechShakti-main/widrsx` project, install dependencies:

```bash
pip install -r requirements.txt
```

For development without a Wi-Fi monitor interface, run mock mode:

```bash
python main.py --mock --port 5000
```

For live capture, replace the interface with the machine's monitor-mode interface:

```bash
python main.py --interface wlan1mon --port 5000
```

The Flask server enables CORS, so a local Vite frontend can call it directly.

## Frontend behavior

The dashboard polls the WIDRS-X backend every 5 seconds. If the backend cannot be reached, the UI shows an offline state instead of crashing.

## Files added/updated

- `src/services/widrsxApi.ts`
- `src/components/Dashboard/TelemetryMetrics.tsx`
- `src/components/Dashboard/EventLogs.tsx`
- `src/components/Dashboard/NetworkGraph.tsx`
- `.env.example.widrsx`
