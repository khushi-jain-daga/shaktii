# SHAKTII Hackathon Live Demo Runbook

Use Node.js 22.13 or newer for the Expo SDK 57 toolchain.

## 1. Start the Node API

PowerShell:

```powershell
cd server
npm install
npm run test:demo
npm start
```

The smoke test should print:

```text
SHAKTII demo capture verified
Packets: 40
Threat: CRITICAL
Risk: 91/100
Finding: Port Scan / Reconnaissance (T1046)
```

Keep this terminal open during judging.

## 2. Connect the Expo app

For a physical Android phone, run:

```powershell
ipconfig
```

Find the laptop's Wi-Fi IPv4 address, then create `mobile/.env`:

```text
EXPO_PUBLIC_API_URL=http://YOUR_LAPTOP_IP:4000
```

Example:

```text
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000
```

Then:

```powershell
cd mobile
npm install
npx expo start
```

Open the project in Expo Go.

## 3. Demo login

```text
Email: demo@shaktii.ai
Password: SHAKTII2026
```

## 4. Judge demo sequence

1. **Login** → show that the app is talking to the Node API.
2. **Security Command dashboard** → show initial session counters.
3. Tap **Upload & Analyze**.
4. Select `demo/port-scan-demo.pcap` from the phone's Files app. If moving the PCAP to the phone is inconvenient, use **Load Demo Attack Log** as the backup path.
5. Tap **Initialize Analysis**.
6. Show the result: **CRITICAL**, approximately **91/100**, 40 packets, **Port Scan / Reconnaissance**, MITRE-style `T1046`.
7. Scroll through protocol/source/port analytics and recommended response.
8. Tap **Generate & Share PDF Report** and open/share the real PDF.
9. Return to Dashboard and show that the session counters changed.

## 5. What to tell judges

> SHAKTII does not depend on an AI model to invent the detection. The Node.js engine first parses the packet capture and produces deterministic network evidence and a threat score. If Gemini is configured, AI is used only to improve the analyst-readable explanation and remediation. The system remains functional when the AI provider or internet is unavailable.

## 6. Optional Gemini enrichment

Set `GEMINI_API_KEY` before starting the Node server. Never put this key in the Expo `.env`; Expo `EXPO_PUBLIC_*` variables are client-visible.

## 7. Current prototype boundary

The hackathon API keeps incident history in memory. The production follow-up should swap `server/src/store.js` for the persistent Prisma/database layer. The original Vite/Vercel website remains untouched by this mobile demo stack.
