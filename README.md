# Trading Flow

Full-stack fintech and investment dashboard built with Next.js App Router, Tailwind CSS, JWT authentication, automated daily ROI accrual, referral accounts, and an Android WebView app.

## Features

- Responsive user dashboard with mobile bottom navigation
- Daily profit calculator and per-contract profit breakdown
- Investment plans: Starter 1.5%, Premium 2.0%, VIP 3.0%
- Deposit and withdrawal approval workflow
- Invite-only registration with sponsor referral codes
- Admin user creation, balance adjustments, and audit notes
- Protected daily profit cron endpoint
- Signed Android APK and automatic website updates inside the app

## Local development

```bash
npm install
npm run dev
```

Required auth secrets are documented in `.env.example`. Set a first admin before using an empty database:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='at-least-12-characters' npm run dev
```

## Deployment

See [README_DEPLOY.md](README_DEPLOY.md) for Vercel environment variables, cron setup, Android APK builds, and the production persistence requirement.

## Android app

Build with JDK 17 and the Android SDK:

```bash
APP_URL=https://your-production-domain npm run apk:build
```

The downloadable APK is served from `/download`, and the installed app loads the latest deployed website automatically.
