import type { Metadata, Viewport } from "next";
import "./globals.css";
import SupportChat from "@/components/support/SupportChat";
import { COMPANY, SITE_URL } from "@/lib/site";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Trading Flow Capital | UK Investment Dashboard",
    template: "%s | Trading Flow Capital",
  },
  description:
    "A UK-focused investment dashboard for comparing transparent plans, tracking projected daily profit and reviewing portfolio activity.",
  applicationName: COMPANY.name,
  authors: [{ name: COMPANY.legalName, url: SITE_URL }],
  creator: COMPANY.name,
  publisher: COMPANY.legalName,
  category: "finance",
  keywords: [
    "UK investment platform",
    "investment dashboard",
    "daily profit tracker",
    "investment plans UK",
    "portfolio reporting",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: COMPANY.name,
    title: "Trading Flow Capital | UK Investment Dashboard",
    description:
      "Compare investment plans, projected daily profit and portfolio activity in one UK-focused dashboard.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Trading Flow Capital — UK investment dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Flow Capital | UK Investment Dashboard",
    description:
      "Compare investment plans, projected daily profit and portfolio activity in one UK-focused dashboard.",
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
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  verification: googleVerification ? { google: googleVerification } : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080C15",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className="dark">
      <body className="bg-background min-h-screen text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
        <SupportChat />
      </body>
    </html>
  );
}
