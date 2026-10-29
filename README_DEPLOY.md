# Trading Flow deployment

## Vercel

1. Push this project to a GitHub repository.
2. Import the repository in Vercel. The configured production URL is
   `https://trading-flow-capital.vercel.app`; use that value for `NEXT_PUBLIC_APP_URL` and
   `APP_URL`.
3. Add these environment variables in Vercel:
   - `JWT_SECRET` - random value, at least 32 characters
   - `CRON_SECRET` - random value, at least 32 characters
   - `NEXT_PUBLIC_APP_NAME=Trading Flow`
   - `NEXT_PUBLIC_APP_URL=https://your-production-domain` (used for canonical URLs, sitemap and Open Graph)
   - `ENABLE_DEMO_ACCOUNTS=false`
   - Optional: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` (12+ characters) for the first admin
   - `DATABASE_URL` - Supabase PostgreSQL Session Pooler connection string
   - `GEMINI_API_KEY` for the AI support assistant
   - Optional: `GEMINI_MODEL` (defaults to `gemini-3.8-flash`)
   - Optional: `ADMIN_NAME`
   - The platform referral code is fixed to `trading flow` (stored as `TRADING FLOW`). No environment variable is required.
4. Deploy. The daily 2% deposit-profit cron is configured in `vercel.json` and calls
   `/api/cron/accrue-profits` every day at `00:00` UTC.
5. If the production domain changes, update the `APP_URL` GitHub repository variable and the
   Vercel `NEXT_PUBLIC_APP_URL`, then run the Android workflow.

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Production persistence

When `DATABASE_URL` is set, the application stores its full state in a PostgreSQL
`public.app_state` JSONB row. The table is created automatically on first connection and row-level
locking serialises writes across serverless instances. Supabase Session Pooler (port 5432) is
recommended because direct database hosts may be IPv6-only.

If `DATABASE_URL` is not set, the app falls back to the local JSON file (`.data/db.json`, or
`/tmp` on Vercel). That fallback is for local development only and is not durable.

On first PostgreSQL startup, the app seeds the configured admin account, the plan catalogue and
default deposit accounts. Demo users are not seeded when `ENABLE_DEMO_ACCOUNTS=false`.

## AI support assistant

The support widget calls `POST /api/support/chat`, which uses Gemini server-side. The API key is
never sent to the browser. Add `GEMINI_API_KEY` to `.env.local` or Vercel; optionally override
`GEMINI_MODEL` (default `gemini-3.8-flash`).

The assistant is grounded with the application's plans, profit formula, account workflows, security
details, legal pages and contact information in `src/lib/support-knowledge.ts`. This is
retrieval-style grounding rather than custom model fine-tuning. Update that file whenever product
terms change.

AI chat requests are rate-limited per serverless instance, enforce message length/history limits,
and are not written to the investment ledger. If the key is missing, the widget directs users to
the support email instead of failing silently.

## Real accounts

Demo login buttons have been removed and demo accounts are blocked unless
`ENABLE_DEMO_ACCOUNTS=true`. Users can register normally from `/register`.

To create an admin in the local JSON store:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='a-long-private-password' npm run create-admin
```

## Android APK

The APK is a lightweight WebView shell that loads the live production website. Website updates are
available in the installed app immediately, without reinstalling the APK.

Build locally with JDK 17 and the Android SDK:

```bash
JAVA_HOME=/path/to/jdk-17 APP_URL=https://your-production-domain npm run apk:build
```

Output:

- `public/downloads/trading-flow.apk`
- `public/downloads/app-version.json`

The app has a server-address recovery screen if the deployed URL is unreachable. To permanently set
a different URL, rebuild with the correct `APP_URL`.

The build uses the Android debug keystore for direct sideloading. Before Play Store distribution,
create and securely back up a permanent release keystore, then sign the release build with it. Never
commit keystore passwords.

For native wrapper changes, run the `Build Android APK` GitHub workflow. It rebuilds the APK and
commits it to `public/downloads`, which triggers a new Vercel deployment.
