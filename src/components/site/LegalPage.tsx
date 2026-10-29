import Link from "next/link";
import { Mail } from "lucide-react";
import { breadcrumbJsonLd } from "@/lib/seo";
import { COMPANY } from "@/lib/site";

interface LegalPageProps {
  title: string;
  summary: string;
  path: string;
  children: React.ReactNode;
}

export default function LegalPage({ title, summary, path, children }: LegalPageProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(title, path)).replace(/</g, "\\u003c"),
        }}
      />
      <section className="border-b border-red-900/20 bg-[#FFF5F5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-[#6B1D1D] mb-5">
            <Link href="/" className="hover:text-red-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#3F1414]">{title}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2B0B0E]">{title}</h1>
          <p className="mt-4 text-sm text-[#5B1B1B] leading-relaxed max-w-2xl">{summary}</p>
          <p className="mt-4 text-[11px] text-[#6B1D1D]">Last updated: {COMPANY.effectiveDate}</p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-9 text-sm text-[#5B1B1B] leading-relaxed">{children}</div>

        <aside className="mt-12 rounded-2xl border border-red-900/20 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#2B0B0E]">Questions about this policy?</p>
            <p className="text-xs text-[#5B1B1B] mt-1">
              Contact {COMPANY.legalName} using the details below.
            </p>
          </div>
          <a
            href={`mailto:${COMPANY.email}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-red-800 hover:text-red-900"
          >
            <Mail className="w-4 h-4" />
            {COMPANY.email}
          </a>
        </aside>
      </article>
    </>
  );
}
