import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Layers,
  Lock,
  Plus,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import DemoActivityCarousel from "@/components/site/DemoActivityCarousel";
import FloatingBitcoin from "@/components/site/FloatingBitcoin";
import Hero3D from "@/components/site/Hero3D";
import { createPageMetadata } from "@/lib/seo";
import { SITE_PLANS } from "@/lib/site";
import { PLATFORM_REFERRAL_CODE, displayReferralCode } from "@/lib/referral";

export const metadata: Metadata = createPageMetadata({
  title: "UK Investment Dashboard & Transparent Investment Plans",
  description:
    "Trading Flow Capital gives UK-focused investors a clear view of investment plans, projected daily profit, transaction history and portfolio reporting.",
  path: "/",
  keywords: [
    "UK investment dashboard",
    "investment plans UK",
    "daily profit tracker",
    "portfolio dashboard",
    "Trading Flow Capital",
  ],
});

const benefits = [
  {
    icon: BarChart3,
    title: "Clear portfolio reporting",
    text: "See active capital, projected daily profit and every ledger entry from one dashboard.",
  },
  {
    icon: Layers,
    title: "Defined plan terms",
    text: "Deposit from $10 with no maximum, then earn a fixed 2% daily after each deposit's 24-hour wait.",
  },
  {
    icon: Clock,
    title: "Daily profit visibility",
    text: "Automated accrual logic records each day's ROI and updates the remaining contract term.",
  },
  {
    icon: Users,
    title: "Invitation-based access",
    text: `Registration defaults to the platform invitation code ${displayReferralCode(
      PLATFORM_REFERRAL_CODE
    )}, while sponsor codes keep every account traceable.`,
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    text: `Register with the platform invitation code ${displayReferralCode(
      PLATFORM_REFERRAL_CODE
    )} or your sponsor's code, then sign in through the secure session flow.`,
  },
  {
    number: "02",
    title: "Review your options",
    text: "Start with the single 2% daily deposit plan using the built-in profit calculator.",
  },
  {
    number: "03",
    title: "Fund and activate",
    text: "Submit a deposit request, choose a plan within your available balance and activate a contract.",
  },
  {
    number: "04",
    title: "Track daily activity",
    text: "Monitor projected daily profit, remaining term days, withdrawals and transaction history.",
  },
];

const homeFaqs = [
  {
    question: "What is Trading Flow Capital?",
    answer:
      "Trading Flow Capital is a UK-focused investment dashboard demonstration. It shows how investment plans, projected daily profit, deposits, withdrawals and ledger records can be presented in one account.",
  },
  {
    question: "Which investment plans are available?",
    answer:
      "There is one plan: the Daily 2% Plan. The minimum deposit is $10, there is no maximum, and approved deposits earn 2% every 24 hours after a 24-hour waiting period. Plan figures are illustrative, not guaranteed.",
  },
  {
    question: "How is daily profit calculated?",
    answer:
      "Daily profit is 2% of the total approved deposits that have passed the 24-hour waiting period. For example, $1,000 in eligible deposits projects $20 per day before applicable terms.",
  },
  {
    question: "When are daily profits credited?",
    answer:
      "The 2% profit process runs hourly and credits each user at most once every 24 hours. Only approved deposits older than 24 hours are included in that day's eligible balance.",
  },
  {
    question: "How do deposits and withdrawals work?",
    answer:
      "Deposits start at $10 and remain pending until human review. Withdrawals start at $20 and include a 2% handling fee added to the requested amount. Withdrawal requests are also reviewed before processing.",
  },
  {
    question: "Is Trading Flow Capital regulated by the FCA?",
    answer:
      "No. The website is a demonstration and Trading Flow Capital Ltd is not authorised or regulated by the Financial Conduct Authority. It does not offer regulated investment services. Capital is at risk and nothing on the site is financial advice.",
  },
  {
    question: "How can I access the investor dashboard?",
    answer:
      "Access uses the platform invitation code trading flow by default, or a sponsor's referral code. Once registered, you can sign in to view plans, the profit calculator, deposits, withdrawals, transaction history and your 15-level referral network.",
  },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const platformFacts = [
  { value: "1", label: "Daily 2% plan" },
  { value: "24h", label: "Reporting cycle" },
  { value: "4", label: "Activity categories" },
  { value: "UK", label: "Support hours" },
];

const moneyMovements = [
  {
    icon: TrendingUp,
    title: "Daily investments",
    text: "Review each approved deposit's amount, 24-hour activation time and 2% daily earnings.",
    tag: "Investment",
  },
  {
    icon: CircleDollarSign,
    title: "Daily profits",
    text: "See projected daily profit per active contract and profit already recorded in the ledger.",
    tag: "Profit",
  },
  {
    icon: ArrowDownLeft,
    title: "Deposits",
    text: "Follow deposit requests from pending review through to an approved wallet credit.",
    tag: "Deposit",
  },
  {
    icon: ArrowUpRight,
    title: "Withdrawals",
    text: "Check pending requests, the 2% handling fee and the net amount requested for payout.",
    tag: "Withdrawal",
  },
];

export default function HomePage() {
  const nonce = headers().get("x-nonce") || undefined;
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <section className="relative overflow-hidden border-b border-red-900/20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/4 w-[32rem] h-[32rem] rounded-full bg-red-100 blur-3xl" />
          <div className="absolute top-24 right-0 w-[28rem] h-[28rem] rounded-full bg-red-100 blur-3xl" />
        </div>
        <FloatingBitcoin
          className="left-[4%] top-[24%] hidden xl:block"
          size={44}
          delay={1.4}
          duration={9}
          spinDuration={18}
          opacity={0.3}
        />
        <FloatingBitcoin
          className="right-[2%] bottom-[13%] hidden md:block"
          size={64}
          delay={3.2}
          duration={11}
          spinDuration={21}
          opacity={0.24}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-8 items-center">
          <div className="max-w-3xl hero-copy">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-700" />
              UK-focused investment platform
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2B0B0E] leading-[1.05]">
              A clearer way to invest, track and grow.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-[#3F1414] leading-relaxed max-w-2xl">
              Trading Flow Capital brings investment plans, projected daily profit and transaction
              reporting into one straightforward dashboard built for UK investors who value
              visibility.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm transition shadow-lg shadow-red-900/20"
              >
                Open investor portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#plans"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-red-900/20 hover:border-red-400 text-[#2B0B0E] font-semibold text-sm transition"
              >
                View daily plan
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#5B1B1B]">
              {[
                "Transparent daily reporting",
                "One 2% daily plan",
                `Invitation code: ${displayReferralCode(PLATFORM_REFERRAL_CODE)}`,
              ].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-800" />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="hero-visual relative mt-8 lg:mt-0">
            <Hero3D />
          </div>
          </div>
        </div>
      </section>

      <section aria-label="Platform overview" className="border-b border-red-900/20 bg-[#FFF5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {platformFacts.map((fact) => (
              <div key={fact.label} className="rounded-xl border border-red-900/20 bg-white px-4 py-4">
                <p className="text-2xl font-extrabold tracking-tight text-[#2B0B0E]">{fact.value}</p>
                <p className="mt-0.5 text-[11px] text-[#6B1D1D]">{fact.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="relative overflow-hidden py-20 sm:py-24">
        <FloatingBitcoin
          className="right-[2%] top-14 hidden sm:block"
          size={50}
          delay={0.6}
          duration={10}
          spinDuration={17}
          opacity={0.28}
        />
        <FloatingBitcoin
          className="left-[1.5%] bottom-10 hidden lg:block"
          size={38}
          delay={4}
          duration={12}
          spinDuration={23}
          opacity={0.2}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800 mb-3">
              Why Trading Flow
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2B0B0E]">
              Designed to make investment details easier to understand
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#5B1B1B] leading-relaxed">
              A dashboard is only useful when the numbers are readable. We focus on plan clarity,
              daily reporting and a complete view of account activity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article
                  key={benefit.title}
                  className="glass-card rounded-2xl p-5 border border-red-900/20"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-400 flex items-center justify-center text-red-800 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#2B0B0E] text-sm">{benefit.title}</h3>
                  <p className="mt-2 text-xs text-[#5B1B1B] leading-relaxed">{benefit.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="plans" className="relative overflow-hidden py-20 sm:py-24 bg-[#FFF5F5] border-y border-red-900/20">
        <FloatingBitcoin
          className="left-[2%] top-20 hidden sm:block"
          size={70}
          delay={2.2}
          duration={13}
          spinDuration={24}
          opacity={0.22}
        />
        <FloatingBitcoin
          className="right-[4%] bottom-16 hidden lg:block"
          size={46}
          delay={1}
          duration={9.5}
          spinDuration={16}
          opacity={0.26}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800 mb-3">
                Daily plan
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2B0B0E]">
                Defined terms before you commit
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#5B1B1B] leading-relaxed">
                One simple plan: deposit from $10, no maximum, and earn 2% every 24 hours after
                the deposit's activation wait. Use the dashboard calculator to see projected profit.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-800 hover:text-red-900"
            >
              Open the calculator
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 max-w-xl mx-auto gap-5 mt-10">
            {SITE_PLANS.map((plan) => (
              <article
                key={plan.name}
                className="relative rounded-3xl border border-yellow-400/35 bg-[#0B0B0C] p-5 pt-12 sm:p-7 sm:pt-14 flex flex-col shadow-2xl shadow-yellow-500/10"
              >
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-yellow-400/10 blur-3xl" />
                </div>
                <span className="absolute top-4 left-5 sm:left-7 px-3 py-1 rounded-full bg-yellow-400 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-lg shadow-yellow-500/20">
                  Most popular
                </span>
                <h3 className="relative text-lg sm:text-xl font-extrabold text-white">{plan.name}</h3>
                <p className="relative mt-2 text-xs text-neutral-300 leading-relaxed">
                  {plan.description}
                </p>
                <div className="relative mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-yellow-300">
                    {plan.rate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">
                    daily
                  </span>
                </div>
                <div className="relative mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-300">
                    24h activation
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                    No lock-in
                  </span>
                </div>
                <dl className="relative mt-6 pt-5 border-t border-yellow-400/15 space-y-3 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-400">Payout schedule</dt>
                    <dd className="font-semibold text-white">Every 24 hours</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-400">Minimum</dt>
                    <dd className="font-bold text-white">
                      ${plan.minimum.toLocaleString("en-GB")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-400">Maximum</dt>
                    <dd className="font-bold text-yellow-300">Unlimited</dd>
                  </div>
                </dl>
                <Link
                  href="/login"
                  className="relative mt-7 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-extrabold uppercase tracking-wider transition shadow-lg shadow-yellow-500/20"
                >
                  View in dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-5 text-[11px] text-[#6B1D1D]">
            Plan rates are illustrative, not guaranteed, and do not represent a forecast. Capital
            is at risk.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800 mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2B0B0E]">
              Four steps from account to daily reporting
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {steps.map((step) => (
              <article key={step.number} className="glass-card rounded-2xl p-5 border border-red-900/20">
                <span className="text-xs font-bold text-red-800">{step.number}</span>
                <h3 className="mt-3 font-bold text-[#2B0B0E] text-sm">{step.title}</h3>
                <p className="mt-2 text-xs text-[#5B1B1B] leading-relaxed">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="py-20 sm:py-24 bg-[#FFF5F5] border-y border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800 mb-3">
                Security & responsibility
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2B0B0E]">
                Clear records, protected access and honest expectations
              </h2>
              <p className="mt-4 text-sm text-[#5B1B1B] leading-relaxed">
                Access is protected with HTTP-only signed sessions, passwords are hashed before
                storage, and every balance-changing action is written to the transaction ledger.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-red-900/20 text-[#2B0B0E] text-xs font-semibold hover:border-red-400"
                >
                  About our approach
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-700 text-white text-xs font-bold hover:bg-red-800"
                >
                  Contact the team
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Lock,
                  title: "Session protection",
                  text: "Signed, HTTP-only cookies help protect your investor session.",
                },
                {
                  icon: Wallet,
                  title: "Ledger-based balances",
                  text: "Deposits, withdrawals, investments and profit payouts are recorded as transactions.",
                },
                {
                  icon: CalendarDays,
                  title: "Daily accrual records",
                  text: "The 2% daily process checks eligible approved deposits before crediting profit.",
                },
                {
                  icon: TrendingUp,
                  title: "Risk-aware presentation",
                  text: "Plan rates are shown as illustrative terms, never as guaranteed outcomes.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl bg-white border border-red-900/20 p-5">
                    <Icon className="w-5 h-5 text-red-800 mb-3" />
                    <h3 className="text-sm font-bold text-[#2B0B0E]">{item.title}</h3>
                    <p className="mt-2 text-xs text-[#5B1B1B] leading-relaxed">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      <section id="activity" className="relative overflow-hidden py-20 sm:py-24">
        <FloatingBitcoin
          className="right-4 top-8 sm:right-[4%] sm:top-12"
          size={40}
          delay={2.8}
          duration={8.5}
          spinDuration={15}
          opacity={0.22}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-300 text-black border border-yellow-400 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-red-700" />
                Interactive activity ledger
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2B0B0E]">
                A day on the platform, slide by slide
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#5B1B1B] leading-relaxed">
                Explore 24 simulated records across daily investments, profit credits, deposits and
                withdrawals. Every slide includes a record ID, member name, amount and status.
              </p>
            </div>
            <div className="rounded-xl border border-yellow-400/25 bg-black px-4 py-3 text-xs text-neutral-300">
              <span className="block font-semibold text-yellow-300">How to read the feed</span>
              <span className="mt-1 block">Auto-slides every 4.2s · Pause or browse manually</span>
            </div>
          </div>

          <div className="mt-9 rounded-3xl border border-yellow-400/20 bg-[#0B0B0C] p-4 sm:p-6 shadow-2xl shadow-red-950/30">
            <DemoActivityCarousel />
          </div>
        </div>
      </section>

      <section id="tracking" className="py-20 sm:py-24 bg-[#FFF5F5] border-y border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-14 items-start">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800 mb-3">
                Daily money flow
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2B0B0E]">
                Every money movement, in one clear view
              </h2>
              <p className="mt-4 text-sm text-[#5B1B1B] leading-relaxed">
                Investments, projected profit, deposits and withdrawals each have a dedicated place
                in the dashboard, with an amount, status and record reference you can review.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-red-800 hover:text-red-900"
              >
                Open the investor portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {moneyMovements.map((movement, index) => {
                const Icon = movement.icon;
                return (
                  <article
                    key={movement.title}
                    className="group rounded-2xl border border-red-900/20 bg-[#FFF7F7] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-red-400 hover:bg-[#FFF7F7]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="w-10 h-10 rounded-xl bg-red-100 border border-red-400 flex items-center justify-center text-red-800">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.14em] font-bold text-[#7F1D1D]">
                        0{index + 1} · {movement.tag}
                      </span>
                    </div>
                    <h3 className="mt-5 text-base font-bold text-[#2B0B0E]">{movement.title}</h3>
                    <p className="mt-2 text-xs text-[#5B1B1B] leading-relaxed">{movement.text}</p>
                    <div className="mt-5 h-1 rounded-full bg-rose-100 overflow-hidden">
                      <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-red-700/60 to-red-800/30 transition-all duration-500 group-hover:w-full" />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="relative overflow-hidden py-20 sm:py-24">
        <FloatingBitcoin
          className="left-[2%] bottom-24 hidden lg:block"
          size={56}
          delay={3.6}
          duration={11.5}
          spinDuration={19}
          opacity={0.24}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800 mb-3">
              Frequently asked questions
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2B0B0E]">
              Questions before you open the dashboard
            </h2>
            <p className="mt-4 text-sm text-[#5B1B1B] leading-relaxed">
              Clear answers about plans, reporting, access and platform status.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {homeFaqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-red-900/20 bg-[#FFF7F7] open:border-red-400 open:bg-[#FFF7F7] transition-colors"
              >
                <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-[#2B0B0E] group-open:text-[#2B0B0E]">
                    {faq.question}
                  </span>
                  <Plus className="w-4 h-4 shrink-0 text-[#6B1D1D] transition-transform duration-300 group-open:rotate-45 group-open:text-red-800" />
                </summary>
                <p className="px-5 pb-5 text-xs sm:text-sm text-[#5B1B1B] leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 sm:py-24 bg-[#FFF5F5] border-t border-red-900/20">
        <div className="absolute -top-24 left-1/3 w-96 h-96 rounded-full bg-red-100 blur-3xl pointer-events-none" />
        <FloatingBitcoin
          className="left-3 top-10 sm:left-[8%] sm:top-16"
          size={48}
          delay={1.8}
          duration={10.5}
          spinDuration={20}
          opacity={0.22}
        />
        <FloatingBitcoin
          className="right-[5%] bottom-10 hidden md:block"
          size={76}
          delay={4.4}
          duration={14}
          spinDuration={26}
          opacity={0.18}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-400 mb-5">
            <CheckCircle2 className="w-3 h-3" />
            Clear reporting from day one
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2B0B0E]">
            Ready to see your numbers clearly?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#5B1B1B] leading-relaxed max-w-2xl mx-auto">
            Sign in to review plans, calculate projected daily profit and follow every deposit,
            withdrawal and investment in your ledger.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-bold transition shadow-lg shadow-red-900/20"
            >
              Investor login
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-red-900/20 hover:border-red-400 text-[#2B0B0E] text-sm font-semibold transition"
            >
              Contact the team
            </Link>
          </div>
          <p className="mt-5 text-[10px] text-[#7F1D1D]">
            Capital at risk. Demonstration platform. Not authorised or regulated by the FCA.
          </p>
        </div>
      </section>
    </>
  );
}
