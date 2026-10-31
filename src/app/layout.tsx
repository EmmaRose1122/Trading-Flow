import type { Metadata, Viewport } from "next";
import "./globals.css";
import SupportChat from "@/components/support/SupportChat";
import { COMPANY, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CoreChain | Digital Asset Investment Platform",
    template: "%s | CoreChain",
  },
  description:
    "CoreChain combines Bitget execution connectivity, BEP20 settlement on BNB Smart Chain and a transparent investor ledger for daily profit and verified withdrawals.",
  applicationName: COMPANY.name,
  authors: [{ name: COMPANY.legalName, url: SITE_URL }],
  creator: COMPANY.name,
  publisher: COMPANY.legalName,
  category: "finance",
  keywords: [
    "digital asset investment platform",
    "Bitget execution",
    "BEP20 settlement",
    "BNB Smart Chain",
    "daily profit dashboard",
    "verified crypto withdrawals",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_SG",
    url: "/",
    siteName: COMPANY.name,
    title: "CoreChain | Digital Asset Investment Platform",
    description:
      "Bitget execution connectivity, BEP20 settlement on BNB Smart Chain and a transparent investor ledger.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CoreChain — Bitget execution and BEP20 settlement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CoreChain | Digital Asset Investment Platform",
    description:
      "Bitget execution connectivity, BEP20 settlement on BNB Smart Chain and a transparent investor ledger.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/brand/favicon.ico",
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  verification: googleVerification ? { google: googleVerification } : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#DC2626",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-SG" className="dark">
      <body className="bg-background min-h-screen text-[#2B0B0E] antialiased selection:bg-red-700 selection:text-[#2B0B0E]">
        {children}
        <SupportChat />
      </body>
    </html>
  );
}
