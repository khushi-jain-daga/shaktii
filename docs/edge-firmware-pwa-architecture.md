# PWN SHAKTI — Edge Firmware + PWA Architecture

## Product Direction

PWN SHAKTI should not work only as a dashboard. The strongest architecture is:

```text
Router Firmware Agent → Backend Detection Engine → Mobile PWA Response App → Dashboard Investigation
```

This means the system starts detection at the network edge, not after damage is done.

---

## 1. Router Firmware Agent

The firmware/agent will be installed on supported routers or edge gateways.

### Responsibilities

- Collect router/network telemetry
- Monitor DNS, connection attempts, port scans, failed authentication bursts and unusual outbound traffic
- Detect suspicious behavior locally where possible
- Send normalized events to SHAKTII backend
- Receive safe response policies from backend
- Apply reversible containment actions

### Example telemetry fields

```json
{
  "device_id": "router-edge-01",
  "timestamp": "2026-09-05T21:55:00+05:30",
  "src_ip": "185.220.101.45",
  "dst_ip": "10.0.1.12",
  "protocol": "TCP",
  "dst_port": 443,
  "event_type": "failed_login_burst",
  "severity": "high",
  "packet_count": 240,
  "bytes_out": 832000,
  "metadata": {
    "user": "admin",
    "asset": "web-02"
  }
}
```

---

## 2. Backend Detection Engine

The backend receives telemetry from the firmware and converts it into incidents.

### Core APIs

```text
POST /api/ingest-log
POST /api/ingest-telemetry
GET  /api/incidents
GET  /api/incidents/:id
GET  /api/live-console
POST /api/incidents/:id/acknowledge
POST /api/incidents/:id/escalate
POST /api/incidents/:id/contain
POST /api/devices/:id/policy
```

### Responsibilities

- Normalize firmware events
- Clean sensitive fields
- Correlate multiple events into attack chains
- Score risk and confidence
- Forecast likely next attack stage
- Trigger acknowledgement-based escalation
- Send containment policy back to router firmware

---

## 3. Mobile PWA Response App

The PWA allows admins to respond without opening a desktop dashboard.

### PWA responsibilities

- Installable from phone browser
- Open as app-like experience
- Show critical incidents first
- Show acknowledgement SLA timer
- Allow quick approve/contain/escalate actions
- Open incident evidence and timeline
- Work as lightweight response console for field/admin users

### Current PWA files

```text
public/manifest.webmanifest
public/sw.js
index.html PWA meta tags
```

### Current PWA shortcuts

```text
/?view=response → Incident Response App
/?view=pkap     → PKAP Analyzer
```

---

## 4. Containment Flow

```text
Threat detected at router
↓
Firmware sends telemetry to backend
↓
Backend creates incident and forecasts next stage
↓
PWA sends critical alert to admin
↓
If admin acknowledges → manual investigation
↓
If no acknowledgement within SLA → escalation
↓
If still no response → pre-approved safe containment
↓
Router firmware applies reversible policy
```

---

## 5. Safe Firmware Actions

The firmware should not permanently block everything by default. Start with reversible containment.

```text
Temporary IP block
Rate limit source traffic
Block suspicious domain
Freeze suspicious session
Disable suspicious outbound route
Move device to restricted policy group
Rollback policy after admin review
```

---

## 6. Judge Explanation

Use this explanation:

> PWN SHAKTI is designed as an edge-to-response system. We plan to deploy a lightweight firmware agent on the router or edge gateway. It monitors traffic at the network edge and sends normalized events to our backend. The backend correlates the events, predicts the next attack stage, and sends critical incidents to the mobile PWA. If the admin does not acknowledge the incident within the SLA, the system escalates and can push a pre-approved reversible containment policy back to the router, such as temporary IP blocking, rate limiting, suspicious domain blocking, or device isolation.

---

## 7. Overnight MVP Scope

Do now:

```text
1. PWA install support
2. Incident Response GUI
3. Firmware architecture documentation
4. API contract for Docker backend team
5. Simulated firmware telemetry JSON
```

Do after backend is ready:

```text
1. Real Docker backend integration
2. Device registration
3. Live telemetry ingestion
4. Real policy push to router agent
5. Real push notification provider
6. Admin authentication and RBAC
```
