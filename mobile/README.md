# SHAKTII Expo Mobile

Requires Node.js 22.13 or newer.

Expo SDK 57 mobile client for the SHAKTII Node.js hackathon API.

## Run on Android emulator

```bash
cd mobile
npm install
```

Create `.env`:

```text
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

Then:

```bash
npx expo start --android
```

## Run on a physical phone

1. Put phone and laptop on the same Wi-Fi.
2. Run `ipconfig` (Windows) and find the laptop IPv4 address.
3. Set `mobile/.env` to, for example:

```text
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000
```

4. Start the Node server first.
5. Run `npx expo start` in `mobile/` and open it in Expo Go.

Do not use `localhost` for a physical phone: it points to the phone itself.
