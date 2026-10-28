import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trading Flow | Smart Fintech & Investment Platform",
  description: "Next-generation institutional investment dashboard with automated yields, instant search ledger, and high-frequency settlement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background min-h-screen text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

