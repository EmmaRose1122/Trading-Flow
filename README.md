# CoreChain

Full-stack digital-asset investment platform built with Next.js App Router, Tailwind CSS, JWT authentication, Bitget execution connectivity, BEP20 settlement, automated daily profit accrual, referral accounts, and an Android WebView app.

## Features

- Responsive investor dashboard with mobile bottom navigation
- Bitget execution connectivity and a public technology/trust page
- Live market signal overview on the homepage with real public exchange data
- BEP20 settlement on BNB Smart Chain with BscScan-verifiable withdrawal hashes
- Single daily 2% plan: $10 minimum, no maximum, profits after 24-hour deposit maturity
- Deposit approval, daily profit accrual and 24-hour withdrawal limits
- Admin-approved automated BEP20 (BSC) withdrawals with ethers v6, refunds and retries
- KYC, two-factor authentication, payout wallets and a 15-level income planner with approved-volume and active-depth tracking
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
