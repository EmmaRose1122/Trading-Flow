import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Fingerprint,
  KeyRound,
  Landmark,
  Layers3,
  LockKeyhole,
  Network,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";
import { BLOCKCHAIN, COMPANY, EXECUTION } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Technology, Bitget Execution & BEP20 Settlement",
  description:
    "See how CoreChain routes digital-asset orders through Bitget execution infrastructure and settles withdrawals on BNB Smart Chain using BEP20 tokens, with on-chain transaction verification.",
  path: "/technology",
  keywords: [
    "CoreChain technology",
    "Bitget execution",
    "BEP20 settlement",
    "BNB Smart Chain",
    "BSC withdrawal verification",
    "digital asset infrastructure",
  ],
});

const executionSteps = [
  {
    icon: Layers3,
    title: "Plan instruction",
    text: "An approved deposit is added to the investor ledger and its 24-hour eligibility window begins.",
  },
  {
    icon: Network,
    title: "Order routing",
    text: "CoreChain's back office prepares the digital-asset order and sends it through its Bitget execution connectivity.",
  },
  {
    icon: BadgeCheck,
    title: "Fill reconciliation",
    text: "The executed quantity, average price and fees are reconciled before they are written back to the platform ledger.",
  },
  {
    icon: Wallet,
    title: "Investor reporting",
    text: "Eligible balance, daily profit and settlement records are reflected in the dashboard and transaction history.",
  },
];

const settlementPoints = [
  "BEP20 token transfers on BNB Smart Chain (chain ID 56).",
  "A withdrawal is reviewed by an administrator before a transfer is signed.",
  "Every completed payout records a transaction hash that can be checked on BscScan.",
  "A transfer that cannot be verified on-chain is not marked as paid.",
];

const controls = [
  {
    icon: Fingerprint,
    title: "Identity checks",
    text: "KYC review is required before withdrawal access. Identity documents are handled by authorised administrators.",
  },
  {
    icon: LockKeyhole,
    title: "Account security",
    text: "HTTP-only signed sessions, hashed passwords and optional two-factor authentication protect investor access.",
  },
  {
    icon: ShieldCheck,
    title: "Administrator controls",
    text: "Withdrawal approval, rejection and refund actions are restricted to administrator accounts and recorded in the ledger.",
  },
  {
    icon: KeyRound,
    title: "Key isolation",
    text: "The BSC signing key is read only by the server-side withdrawal service. It is never sent to a browser or displayed in the admin UI.",
  },
];

const technologyFaqs = [
  {
    question: "What is Bitget's role in CoreChain?",
    answer:
      "Bitget is the third-party exchange venue used for digital-asset order execution. CoreChain maintains authorised execution connectivity to Bitget's infrastructure and records the resulting activity in its own investor ledger. Bitget is an independent company and does not guarantee CoreChain products.",
  },
  {
    question: "Which blockchain does CoreChain use?",
    answer:
      "Withdrawals settle in BEP20 tokens on BNB Smart Chain (BSC), chain ID 56. Completed transfers include a transaction hash that can be opened on BscScan.",
  },
  {
    question: "Can I verify a withdrawal on-chain?",
    answer:
      "Yes. Once a withdrawal is completed, the dashboard shows the transaction hash and a BscScan link. The platform only marks a transfer as completed after the configured on-chain confirmation is received.",
  },
  {
    question: "Does BEP20 settlement guarantee my investment?",
    answer:
      "No. Blockchain settlement makes a payout verifiable after it is sent; it does not remove investment risk, guarantee a return or insure capital. CoreChain does not claim authorisation or regulation by any financial regulator.",
  },
  {
    question: "Where can I get support?",
    answer:
      "CoreChain supports investors through its Singapore support desk. Meetings are arranged by appointment through the contact page; no walk-in street address is published.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: technologyFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function TechnologyPage() {
  const nonce = headers().get("x-nonce") || undefined;

  return (
    <>
      <script
        nonce={nonce}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbJsonLd("Technology", "/technology"),
            faqJsonLd,
          ]).replace(/</g, "\\u003c"),
        }}
      />

      <section className="relative overflow-hidden border-b border-red-900/20 bg-[#FFF5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <nav aria-label="Breadcrumb" className="text-xs text-[#6B1D1D] mb-5">
            <Link href="/" className="hover:text-red-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#3F1414]">Technology</span>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-red-400 bg-red-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-800">
                <Network className="h-3.5 w-3.5" />
                Technology & infrastructure
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2B0B0E] leading-[1.05]">
                Exchange execution. On-chain settlement. One visible ledger.
              </h1>
              <p className="mt-5 text-base text-[#3F1414] leading-relaxed">
                CoreChain connects its back office to {EXECUTION.venue} for digital-asset execution
                and uses {BLOCKCHAIN.standard} on {BLOCKCHAIN.network} for verifiable payouts. This
                page explains exactly where each step happens and what you can check yourself.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800"
                >
                  Open investor portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#settlement"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-900/20 bg-white px-5 py-3 text-sm font-semibold text-[#2B0B0E] transition hover:border-red-400"
                >
                  BEP20 settlement
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-[#5B1B1B]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-800" />
                  {EXECUTION.label}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-800" />
                  BSC chain ID {BLOCKCHAIN.chainId}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-800" />
                  BscScan-verifiable hashes
                </span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-red-900/20 bg-black shadow-2xl shadow-red-900/20">
              <Image
                src="/images/corechain-execution.png"
                alt="Abstract presentation of CoreChain order execution and exchange connectivity"
                width={1792}
                height={1024}
                priority
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-300">
                  Execution layer
                </p>
                <p className="mt-1 text-xs text-neutral-200">
                  {EXECUTION.venue} connectivity · order reconciliation · investor ledger
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-red-900/20 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { value: EXECUTION.venue, label: "Execution venue" },
            { value: String(BLOCKCHAIN.chainId), label: "BSC chain ID" },
            { value: BLOCKCHAIN.standard, label: "Settlement standard" },
            { value: String(BLOCKCHAIN.confirmations), label: "Default confirmation" },
          ].map((item) => (
            <div key={item.label} className="border-r border-red-900/10 px-2 py-6 first:pl-0 last:border-r-0 sm:px-5">
              <p className="text-xl font-extrabold tracking-tight text-[#2B0B0E] sm:text-2xl">
                {item.value}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B1D1D]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="execution" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
              Execution infrastructure
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2B0B0E] sm:text-4xl">
              How a CoreChain position is executed
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#5B1B1B] sm:text-base">
              {EXECUTION.summary} The four stages below are recorded separately so the platform can
              reconcile what was instructed, what was filled and what was credited to an investor.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {executionSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-2xl border border-red-900/20 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400 bg-red-100 text-red-800">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold tracking-wider text-[#7F1D1D]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-sm font-bold text-[#2B0B0E]">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#5B1B1B]">{step.text}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-400/40 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <p className="text-xs leading-relaxed text-amber-900">
                <strong>Independent venue notice:</strong> {EXECUTION.venue} is a third-party
                digital-asset exchange. CoreChain&apos;s execution connectivity does not mean that{" "}
                {EXECUTION.venue} endorses, guarantees or insures CoreChain products. Exchange
                services are subject to {EXECUTION.venue}&apos;s own terms and risk disclosures.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <a
              href={EXECUTION.venueUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/20 bg-white px-3 py-2 text-[#2B0B0E] hover:border-red-400"
            >
              Visit {EXECUTION.venue}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-[#6B1D1D]">
              {EXECUTION.venue} is referenced for transparency only.
            </span>
          </div>
        </div>
      </section>

      <section id="settlement" className="border-y border-red-900/20 bg-[#FFF5F5] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="order-2 lg:order-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
              On-chain settlement
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2B0B0E] sm:text-4xl">
              BEP20 withdrawals you can verify
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#5B1B1B] sm:text-base">
              Once an administrator approves a withdrawal, CoreChain&apos;s server-side wallet
              service signs a BEP20 transfer on BNB Smart Chain. The platform waits for the
              configured confirmation and stores the transaction hash on the withdrawal record.
            </p>
            <ul className="mt-6 space-y-3">
              {settlementPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-xs leading-relaxed text-[#3F1414]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-800" />
                  {point}
                </li>
              ))}
            </ul>

            <dl className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-red-900/20 bg-white p-3.5">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D1D]">
                  Network
                </dt>
                <dd className="mt-1 text-sm font-bold text-[#2B0B0E]">{BLOCKCHAIN.network}</dd>
              </div>
              <div className="rounded-xl border border-red-900/20 bg-white p-3.5">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D1D]">
                  Token standard
                </dt>
                <dd className="mt-1 text-sm font-bold text-[#2B0B0E]">{BLOCKCHAIN.standard}</dd>
              </div>
              <div className="rounded-xl border border-red-900/20 bg-white p-3.5 sm:col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D1D]">
                  Default BEP20 token contract
                </dt>
                <dd className="mt-1 break-all font-mono text-[11px] font-semibold text-red-800">
                  {BLOCKCHAIN.tokenContract}
                </dd>
                <dd className="mt-1 text-[10px] text-[#6B1D1D]">
                  Network and token are configurable by the platform operator. The active contract
                  is shown in the admin withdrawal console.
                </dd>
              </div>
            </dl>

            <a
              href={`${BLOCKCHAIN.explorer}/address/${BLOCKCHAIN.tokenContract}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-red-800 hover:underline"
            >
              View token contract on BscScan
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="order-1 overflow-hidden rounded-3xl border border-red-900/20 bg-white shadow-xl shadow-red-900/10 lg:order-2">
            <Image
              src="/images/corechain-bep20.png"
              alt="Gold chain links connecting blockchain settlement blocks"
              width={1792}
              height={1024}
              className="h-full w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 46vw"
            />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
              Trust & controls
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2B0B0E] sm:text-4xl">
              What protects the platform and what it does not promise
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#5B1B1B] sm:text-base">
              Technology reduces operational uncertainty; it cannot remove market risk. These are
              the controls that are actually implemented in the platform today.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {controls.map((control) => {
              const Icon = control.icon;
              return (
                <article key={control.title} className="rounded-2xl border border-red-900/20 bg-white p-5">
                  <Icon className="h-5 w-5 text-red-800" />
                  <h3 className="mt-3 text-sm font-bold text-[#2B0B0E]">{control.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#5B1B1B]">{control.text}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-red-900/20 bg-[#FFF5F5] p-5">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-red-800" />
                <h3 className="text-sm font-bold text-[#2B0B0E]">Regulatory position</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#5B1B1B]">
                CoreChain does not claim authorisation or regulation by any financial regulator and
                does not provide regulated investment advice. Digital-asset values can fall as well
                as rise, and capital is at risk.
              </p>
            </div>
            <div className="rounded-2xl border border-red-900/20 bg-[#FFF5F5] p-5">
              <div className="flex items-center gap-2">
                <Blocks className="h-4 w-4 text-red-800" />
                <h3 className="text-sm font-bold text-[#2B0B0E]">What BEP20 does not mean</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#5B1B1B]">
                An on-chain transfer is evidence that tokens moved after approval. It is not a
                guarantee of future profit, principal protection or insurance against loss.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-red-900/20 bg-[#FFF5F5] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-red-900/20 bg-white shadow-xl shadow-red-900/10">
            <Image
              src="/images/corechain-singapore.png"
              alt="Singapore financial district skyline at dusk"
              width={1792}
              height={1024}
              className="h-full w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 46vw"
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
              Regional support
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2B0B0E] sm:text-4xl">
              Singapore support desk
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#5B1B1B] sm:text-base">
              Our Singapore support desk coordinates regional onboarding, account questions and
              appointment-based meetings. No walk-in street address is published for this desk;
              meetings are arranged in advance through the contact page.
            </p>
            <dl className="mt-6 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-red-800" />
                <div>
                  <dt className="font-semibold text-[#2B0B0E]">{COMPANY.singapore.label}</dt>
                  <dd className="text-[#5B1B1B]">
                    {COMPANY.singapore.locality} · {COMPANY.singapore.timezone}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-red-800" />
                <div>
                  <dt className="font-semibold text-[#2B0B0E]">Regional coverage</dt>
                  <dd className="text-[#5B1B1B]">
                    Singapore support desk · appointments only
                  </dd>
                </div>
              </div>
            </dl>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-xs font-bold text-white transition hover:bg-red-800"
            >
              Arrange a support appointment
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
              Technology FAQ
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2B0B0E] sm:text-4xl">
              Straight answers about execution and settlement
            </h2>
          </div>
          <div className="mt-8 divide-y divide-red-900/15 rounded-2xl border border-red-900/20 bg-white">
            {technologyFaqs.map((faq) => (
              <details key={faq.question} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#2B0B0E]">
                  {faq.question}
                  <span className="text-lg font-light text-red-800 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-xs leading-relaxed text-[#5B1B1B]">{faq.answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-[11px] leading-relaxed text-[#6B1D1D]">
            Capital is at risk. CoreChain does not claim authorisation or regulation by any
            financial regulator. Nothing on this page is financial, tax or legal advice.
          </p>
        </div>
      </section>
    </>
  );
}
