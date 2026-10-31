/** @type {import('next').NextConfig} */
const configuredAppUrl = (process.env.NEXT_PUBLIC_APP_URL || "")
  .trim()
  .replace(/\/$/, "");
const appUrl =
  configuredAppUrl && !configuredAppUrl.includes("your-project")
    ? configuredAppUrl
    : "https://trading-flow-capital.vercel.app";
const privateNoStore = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    serverComponentsExternalPackages: ["pg"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Access-Control-Allow-Origin", value: appUrl },
        ],
      },
      {
        source: "/api/:path*",
        headers: privateNoStore,
      },
      ...["/dashboard", "/admin", "/plans", "/transactions", "/referrals", "/profile", "/settings", "/login", "/register"].map(
        (source) => ({ source, headers: privateNoStore })
      ),
      {
        source: "/downloads/corechain.apk",
        headers: [
          { key: "Content-Type", value: "application/vnd.android.package-archive" },
          { key: "Content-Disposition", value: "attachment; filename=\"corechain.apk\"" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;

