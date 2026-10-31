import { headers } from "next/headers";
import PublicHeader from "@/components/site/PublicHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default function PublicSiteLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get("x-nonce") || undefined;
  const structuredData = [organizationJsonLd(), websiteJsonLd()];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-red-700 focus:text-white focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>
      <PublicHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <script
        nonce={nonce}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
