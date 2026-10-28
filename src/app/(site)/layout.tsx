import PublicHeader from "@/components/site/PublicHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default function PublicSiteLayout({ children }: { children: React.ReactNode }) {
  const structuredData = [organizationJsonLd(), websiteJsonLd()];

  return (
    <div className="min-h-screen flex flex-col bg-[#080C15]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-emerald-500 focus:text-slate-950 focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>
      <PublicHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
