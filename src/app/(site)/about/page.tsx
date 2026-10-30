import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/site";
import { PLATFORM_REFERRAL_CODE, displayReferralCode } from "@/lib/referral";

export const metadata: Metadata = createPageMetadata({
  title: "About Our UK Investment Platform",
  description:
    "Learn about Trading Flow Capital, our approach to transparent investment reporting, responsible risk communication and UK-based support.",
  path: "/about",
  keywords: ["about Trading Flow Capital", "UK investment platform", "investment reporting UK"],
});

const principles = [
  {
    icon: ShieldCheck,
    title: "Clarity before complexity",
    text: "The single daily plan shows its 2% rate, $10 minimum, unlimited maximum and 24-hour activation before an investor deposits.",
  },
  {
    icon: Users,
    title: "Deliberate access",
    text: `Invitation-based registration keeps onboarding traceable. The platform invitation code is ${displayReferralCode(
      PLATFORM_REFERRAL_CODE
    )}, and sponsor referral codes build the 15-level partner network.`,
  },
  {
    icon: CheckCircle2,
    title: "Records that reconcile",
    text: "Balance movements are recorded as ledger entries so deposits, withdrawals, investments and profit can be reviewed.",
  },
];

export default function AboutPage() {
  const nonce = headers().get("x-nonce") || undefined;
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd("About us", "/about")).replace(/</g, "\\u003c"),
        }}
      />
      <section className="border-b border-red-900/20 bg-[#FFF5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <nav aria-label="Breadcrumb" className="text-xs text-[#6B1D1D] mb-5">
            <Link href="/" className="hover:text-red-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#3F1414]">About us</span>
          </nav>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800 mb-3">
              About Trading Flow Capital
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2B0B0E]">
              Building a more readable investment experience
            </h1>
            <p className="mt-5 text-base text-[#3F1414] leading-relaxed">
              Trading Flow Capital is a UK-focused investment dashboard project designed around one
              idea: investors should be able to understand their plan, projected profit and account
              activity without searching through disconnected information.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#2B0B0E]">Our approach</h2>
              <div className="mt-4 space-y-4 text-sm text-[#5B1B1B] leading-relaxed">
                <p>
                  The platform combines a plan catalogue, a live ROI calculator, a daily profit
                  breakdown and a transaction ledger. Each active investment displays its amount,
                  daily rate, estimated payout and remaining term.
                </p>
                <p>
                  We present investment rates as illustrative plan terms, not guaranteed outcomes.
                  A clear dashboard does not remove investment risk, and every investor should make
                  an informed, independent decision before committing capital.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {principles.map((principle) => {
                const Icon = principle.icon;
                return (
                  <article
                    key={principle.title}
                    className="rounded-2xl border border-red-900/20 bg-white p-5"
                  >
                    <Icon className="w-5 h-5 text-red-800 mb-3" />
                    <h3 className="text-sm font-bold text-[#2B0B0E]">{principle.title}</h3>
                    <p className="mt-2 text-xs text-[#5B1B1B] leading-relaxed">{principle.text}</p>
                  </article>
                );
              })}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#2B0B0E]">Where we are</h2>
              <p className="mt-4 text-sm text-[#5B1B1B] leading-relaxed">
                Our contact and support function is based in Formby, Liverpool, with support hours
                aligned to UK business time. The company address and contact details are shown on
                the contact page and footer.
              </p>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-red-900/20 bg-white p-6">
            <div className="mb-6 overflow-hidden rounded-xl bg-white p-4">
              <Image
                src="/brand/logo-lockup-light.png"
                alt="Trading Flow Capital"
                width={1220}
                height={375}
                className="h-auto w-full"
              />
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-400 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-red-800" />
              </div>
              <h2 className="font-bold text-[#2B0B0E]">Company details</h2>
            </div>
            <dl className="space-y-4 text-xs">
              <div>
                <dt className="text-[#6B1D1D] uppercase tracking-wider text-[10px] font-semibold">
                  Legal name
                </dt>
                <dd className="mt-1 text-[#2B0B0E]">{COMPANY.legalName}</dd>
              </div>
              <div>
                <dt className="text-[#6B1D1D] uppercase tracking-wider text-[10px] font-semibold">
                  Office
                </dt>
                <dd className="mt-1 text-[#2B0B0E] leading-relaxed">{COMPANY.addressLine}</dd>
              </div>
              <div>
                <dt className="text-[#6B1D1D] uppercase tracking-wider text-[10px] font-semibold">
                  Email
                </dt>
                <dd className="mt-1">
                  <a href={`mailto:${COMPANY.email}`} className="text-red-800 hover:underline break-all">
                    {COMPANY.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[#6B1D1D] uppercase tracking-wider text-[10px] font-semibold">
                  Telephone
                </dt>
                <dd className="mt-1">
                  <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="text-red-800 hover:underline">
                    {COMPANY.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#2B0B0E] hover:text-red-900"
            >
              Contact the team
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
