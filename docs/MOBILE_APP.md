# SHAKTII Android App Setup

This branch adds a Capacitor Android wrapper around the existing React + Vite SHAKTII frontend.

## What changed

- Added Capacitor config through `capacitor.config.ts`.
- Added Android app scripts in `package.json`.
- Added a mobile-first SHAKTII command shell at `src/mobile/MobileApp.tsx`.
- Routed native runtime users to the mobile app while keeping the existing web app unchanged.
- Added native helper utilities for report sharing and text-file saving.

## Run web preview

```bash
npm install
npm run dev
```

## Generate Android project

Run this once after installing dependencies:

```bash
npm run android:add
```

## Sync web build into Android

Run this after every frontend change:

```bash
npm run cap:sync
```

## Open in Android Studio

```bash
npm run android
```

Then use Android Studio to run the app on an emulator or connected Android phone.

## Important notes

- Do not commit real `.env` values or API keys.
- The Vercel serverless APIs still power the remote PKAP analysis flow.
- Local heuristic analysis continues to work as fallback when AI provider keys are not configured.
- If Android Studio asks for SDK or Gradle updates, accept the recommended stable setup.

## Demo flow for evaluation

1. Open the SHAKTII Android app.
2. Tap **Analyze Logs**.
3. Paste or upload sample cyber log data.
4. Generate the PKAP risk report.
5. Open **Live Defense** to show the dashboard.
6. Return to Home and use **Share Report** or **Save Report** to demonstrate native mobile behavior.
