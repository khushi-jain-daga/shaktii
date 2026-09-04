# Setup Guide

Follow these steps to run SHAKTII locally or deploy it on Vercel.

## Prerequisites

Install the following:

- Node.js 22 or later
- npm
- Git

## Clone the Repository

```bash
git clone https://github.com/khushi-jain-daga/shaktii.git
cd shaktii
```

## Install Dependencies

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://localhost:5173
```

## Build for Production

```bash
npm run build
```

## Preview Production Build Locally

```bash
npm run preview
```

## Environment Variables

Create a local `.env` file from the provided example:

```bash
cp .env.example.pkap .env
```

Add only the provider keys you want to use. Do not commit `.env`.

## Vercel Deployment

1. Open Vercel.
2. Choose **Add New Project**.
3. Import `khushi-jain-daga/shaktii`.
4. Use these settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

5. Add environment variables if needed.
6. Deploy.

## Common Issues

### 404 on Vercel

Usually means the deployment failed or no successful `dist/` output was generated. Check Vercel build logs.

### API enrichment not working

The local deterministic analyzer works without external keys. Live enrichment requires environment variables to be configured in Vercel.

### CSS import TypeScript error

Ensure this file exists:

```text
src/vite-env.d.ts
```

with:

```ts
/// <reference types="vite/client" />
```
