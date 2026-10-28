import type { Metadata } from "next";
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
    text: "Plan terms, daily rates, minimums and capital-return conditions are shown together before an investor commits.",
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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd("About us", "/about")).replace(/</g, "\\u003c"),
        }}
      />
      <section className="border-b border-white/5 bg-[#060A12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-5">
            <Link href="/" className="hover:text-emerald-400">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-300">About us</span>
          </nav>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3">
              About Trading Flow Capital
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Building a more readable investment experience
            </h1>
            <p className="mt-5 text-base text-slate-300 leading-relaxed">
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
              <h2 className="text-2xl font-bold text-white">Our approach</h2>
              <div className="mt-4 space-y-4 text-sm text-slate-400 leading-relaxed">
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
                    className="rounded-2xl border border-white/5 bg-[#0C1320] p-5"
                  >
                    <Icon className="w-5 h-5 text-emerald-400 mb-3" />
                    <h3 className="text-sm font-bold text-white">{principle.title}</h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">{principle.text}</p>
                  </article>
                );
              })}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Where we are</h2>
              <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                Our contact and support function is presented as London-based, with support hours
                aligned to UK business time. The company address and contact details on this
                demonstration website must be replaced and independently verified before public
                launch.
              </p>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-[#0C1320] p-6">
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
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="font-bold text-white">Company details</h2>
            </div>
            <dl className="space-y-4 text-xs">
              <div>
                <dt className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                  Legal name
                </dt>
                <dd className="mt-1 text-slate-200">{COMPANY.legalName}</dd>
              </div>
              <div>
                <dt className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                  Office
                </dt>
                <dd className="mt-1 text-slate-200 leading-relaxed">{COMPANY.addressLine}</dd>
              </div>
              <div>
                <dt className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                  Email
                </dt>
                <dd className="mt-1">
                  <a href={`mailto:${COMPANY.email}`} className="text-emerald-400 hover:underline break-all">
                    {COMPANY.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                  Telephone
                </dt>
                <dd className="mt-1">
                  <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="text-emerald-400 hover:underline">
                    {COMPANY.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-emerald-400"
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
