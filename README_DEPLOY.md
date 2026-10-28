# Trading Flow deployment

## Vercel

1. Push this project to a GitHub repository.
2. Import the repository in Vercel and keep the project name `trading-flow` if you want the
   current APK default URL (`https://trading-flow.vercel.app`) to work.
3. Add these environment variables in Vercel:
   - `JWT_SECRET` - random value, at least 32 characters
   - `CRON_SECRET` - random value, at least 32 characters
   - `NEXT_PUBLIC_APP_NAME=Trading Flow`
   - `NEXT_PUBLIC_APP_URL=https://your-production-domain`
   - `ENABLE_DEMO_ACCOUNTS=false`
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` (12+ characters) for the first admin
   - Optional: `ADMIN_NAME`, `ADMIN_REFERRAL_CODE`
4. Deploy. The daily ROI cron is configured in `vercel.json` and calls
   `/api/cron/accrue-profits` every day at `00:00` UTC.
5. If the production domain is not `trading-flow.vercel.app`, add a GitHub repository variable
   named `APP_URL` with the real HTTPS URL and run the Android workflow.

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Production persistence

The current data layer stores users and ledgers in a JSON file. On Vercel it automatically uses
`/tmp`, which keeps the preview functional but is reset when a serverless instance is recycled.
This is not durable production storage. Before accepting real registrations or money movements,
connect PostgreSQL (Neon/Supabase), add `DATABASE_URL`, and migrate the data layer. This migration
is not included yet.

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
