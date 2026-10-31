import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Building2,
  Globe2,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";
import BrandLockup from "@/components/site/BrandLockup";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";
import { BLOCKCHAIN, COMPANY, EXECUTION } from "@/lib/site";
import { PLATFORM_REFERRAL_CODE, displayReferralCode } from "@/lib/referral";

export const metadata: Metadata = createPageMetadata({
  title: "About Our Digital Asset Infrastructure",
  description:
    "Learn how CoreChain combines Bitget execution connectivity, BEP20 settlement and transparent investor reporting, with support from Singapore.",
  path: "/about",
  keywords: [
    "about CoreChain",
    "Bitget execution platform",
    "BEP20 investment platform",
    "digital asset infrastructure",
    "Singapore support desk",
  ],
});

const principles = [
  {
    icon: ShieldCheck,
    title: "Clarity before complexity",
    text: "The single daily plan publishes its 2% rate, $10 minimum, unlimited maximum and 24-hour activation before an investor deposits.",
  },
  {
    icon: Network,
    title: "Execution you can follow",
    text: `Orders are routed through authorised ${EXECUTION.venue} execution connectivity and reconciled before the investor ledger is updated.`,
  },
  {
    icon: Blocks,
    title: "Settlement you can verify",
    text: `${BLOCKCHAIN.standard} withdrawals settle on ${BLOCKCHAIN.network}. Completed payouts carry a transaction hash for BscScan verification.`,
  },
  {
    icon: Users,
    title: "Traceable onboarding",
    text: `Invitation-based registration keeps onboarding traceable. The platform invitation code is ${displayReferralCode(
      PLATFORM_REFERRAL_CODE
    )}, and sponsor codes build the 15-level partner network.`,
  },
];

export default function AboutPage() {
  const nonce = headers().get("x-nonce") || undefined;
  return (
    <>
      <script
        nonce={nonce}
        suppressHydrationWarning
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
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800 mb-3">
                About CoreChain
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2B0B0E]">
                A digital-asset investment platform built around visible records
              </h1>
              <p className="mt-5 text-base text-[#3F1414] leading-relaxed">
                CoreChain brings exchange execution, blockchain settlement and investor reporting
                into one account. The aim is straightforward: show the terms before a deposit, show
                the execution route behind the plan and show the on-chain reference after a payout.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/technology"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800"
                >
                  Explore the technology
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-900/20 bg-white px-5 py-3 text-sm font-semibold text-[#2B0B0E] transition hover:border-red-400"
                >
                  Contact the team
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-red-900/20 bg-white p-6 shadow-xl shadow-red-900/10">
              <BrandLockup iconSize={64} priority />
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-red-900/15 bg-[#FFF5F5] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D1D]">
                    Execution
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-[#2B0B0E]">{EXECUTION.venue}</p>
                </div>
                <div className="rounded-xl border border-red-900/15 bg-[#FFF5F5] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D1D]">
                    Settlement
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-[#2B0B0E]">
                    {BLOCKCHAIN.standard}
                  </p>
                </div>
                <div className="rounded-xl border border-red-900/15 bg-[#FFF5F5] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D1D]">
                    Network
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-[#2B0B0E]">BNB Smart Chain</p>
                </div>
                <div className="rounded-xl border border-red-900/15 bg-[#FFF5F5] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D1D]">
                    Support
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-[#2B0B0E]">Singapore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-[#2B0B0E]">Our approach</h2>
              <div className="mt-4 space-y-4 text-sm text-[#5B1B1B] leading-relaxed">
                <p>
                  The platform combines a plan catalogue, a live profit calculator, a daily profit
                  breakdown and a transaction ledger. Each active deposit displays its amount, daily
                  rate, estimated payout and remaining eligibility window.
                </p>
                <p>
                  We present investment rates as illustrative plan terms, not guaranteed outcomes.
                  A visible ledger and verifiable blockchain payout do not remove investment risk.
                  Every investor should make an informed, independent decision before committing
                  capital.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="overflow-hidden rounded-3xl border border-red-900/20 bg-white">
              <div className="relative aspect-[16/9]">
                <Image
                  src="/images/corechain-singapore.png"
                  alt="Singapore financial district skyline"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-red-800" />
                  <h2 className="text-2xl font-bold text-[#2B0B0E]">Where we are</h2>
                </div>
                <p className="mt-3 text-sm text-[#5B1B1B] leading-relaxed">
                  CoreChain supports investors through its Singapore support desk for regional
                  onboarding, account questions and appointment-based meetings. The desk does not
                  publish a walk-in street address; meetings are arranged through the contact page.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="rounded-full border border-red-400 bg-red-100 px-2.5 py-1 text-red-800">
                    Singapore support desk
                  </span>
                  <span className="rounded-full border border-red-400 bg-red-100 px-2.5 py-1 text-red-800">
                    Appointments only
                  </span>
                </div>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-red-900/20 bg-white p-6">
            <div className="mb-6 overflow-hidden rounded-xl border border-red-900/15 bg-[#FFF5F5] p-4">
              <BrandLockup iconSize={48} />
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
                  Brand
                </dt>
                <dd className="mt-1 text-[#2B0B0E]">{COMPANY.name}</dd>
              </div>
              <div>
                <dt className="text-[#6B1D1D] uppercase tracking-wider text-[10px] font-semibold">
                  Support desk
                </dt>
                <dd className="mt-1 text-[#2B0B0E] leading-relaxed">
                  {COMPANY.singapore.label}
                  <span className="mt-1 block text-[10px] text-[#6B1D1D]">
                    {COMPANY.singapore.locality} · Appointments only ·{" "}
                    {COMPANY.singapore.timezone}
                  </span>
                </dd>
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
