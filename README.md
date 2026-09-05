# SHAKTII — Full-Stack Security Operations Platform

SHAKTII is now a routed full-stack cybersecurity application built with **React + Node.js + Express + TypeScript + PostgreSQL + Prisma**. The original PKAP and WIDRS-X integrations are preserved while file security, blockchain-style verification, analytics, security events, audit logs, reports, authentication, PWA support, and multi-page navigation are handled by the Node application.

## Stack

- React 19 + TypeScript + Vite
- React Router
- Node.js + Express 5 + TypeScript
- PostgreSQL + Prisma
- JWT access tokens + rotating refresh tokens
- bcrypt password hashing
- Multer uploads
- SHA-256 file fingerprints
- AES-256-GCM file encryption
- Recharts analytics
- Helmet, CORS, rate limiting, Zod validation
- PWA manifest + service worker

## Main Routes

- `/login` and `/register`
- `/dashboard`
- `/files`
- `/upload`
- `/blockchain`
- `/security`
- `/analytics`
- `/activity`
- `/reports`
- `/pkap`
- `/network-console`

## Node API

- `/api/auth/*`
- `/api/dashboard`
- `/api/files/*`
- `/api/blockchain/*`
- `/api/security/*`
- `/api/analytics/*`
- `/api/reports/*`
- `/api/pkap/*`
- `/api/health`

## Local Setup

1. Install Node.js 22+ and PostgreSQL.
2. Install dependencies:

```bash
npm install
```

3. Copy the full-stack environment template:

```bash
cp .env.example .env
```

4. Update `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `ENCRYPTION_KEY` in `.env`.

5. Generate Prisma client and apply the migration:

```bash
npm run db:generate
npm run db:deploy
```

6. Optional: seed local demo users and events:

```bash
npm run db:seed
```

The development seed creates:

- `admin@shaktii.local` — ADMIN
- `analyst@shaktii.local` — SECURITY_ANALYST
- `user@shaktii.local` — USER

Set `SEED_PASSWORD` in `.env` to control the development password. Production seeding is blocked unless `ALLOW_PRODUCTION_SEED=true` is explicitly set.

7. Start frontend and backend together:

```bash
npm run dev
```

Frontend defaults to `http://localhost:5173`. Node API defaults to `http://localhost:4000/api`.

## Production

Build both frontend and server:

```bash
npm run build
```

Apply production migrations:

```bash
npm run db:deploy
```

Run the Node application:

```bash
NODE_ENV=production npm start
```

In production, Express serves the built React SPA from `dist/` and handles `/api/*`, so the application can be deployed as one Node service.

## Security Model

- Passwords are hashed using bcrypt.
- Access tokens are short-lived JWTs.
- Refresh tokens are random, stored hashed in PostgreSQL, rotated on refresh, and revoked on logout.
- Security-event mutation routes require `ADMIN` or `SECURITY_ANALYST` role.
- Uploaded files receive generated server-side filenames.
- Files are fingerprinted with SHA-256.
- File encryption uses AES-256-GCM with IV and authentication tag metadata.
- Sensitive secrets belong only in environment variables.
- Production seeding is disabled by default.

## Demo Workflow

```text
Register / Login
→ Dashboard
→ Upload File
→ SHA-256 fingerprint
→ AES-256-GCM encryption
→ Integrity verification
→ Blockchain record registration
→ Blockchain verification
→ Security monitoring
→ Analytics
→ Audit logs
→ Reports / CSV export
```

## PWA Behavior

The app includes a manifest and service worker. The Install App control appears only when the browser exposes an install prompt and the app is not already running in standalone mode. Once installed, the install control disappears. If the browser later exposes a fresh install prompt after uninstall, the state is reset correctly.

## Existing Integrations Preserved

The previous PKAP serverless capabilities and WIDRS-X client integration remain in the repository during migration. The dedicated Node routes and routed UI are the primary full-stack application architecture.

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:push
npm run db:seed
npm run db:studio
```

## Branding

The application uses the repository brand assets under `public/pwn-shakti-logo.svg` and `public/pwn-shakti-main-logo.svg` for authenticated navigation, login/register surfaces, favicon, and PWA metadata.
