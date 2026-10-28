import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { createPageMetadata } from "@/lib/seo";
import { SITE_PLANS } from "@/lib/site";

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
    text: "Compare rate, term, minimum allocation and capital-return terms before committing.",
  },
  {
    icon: Clock,
    title: "Daily profit visibility",
    text: "Automated accrual logic records each day's ROI and updates the remaining contract term.",
  },
  {
    icon: Users,
    title: "Invitation-based access",
    text: "Registration uses sponsor referral codes, keeping account creation deliberate and traceable.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    text: "Register with a valid sponsor referral code and sign in through the secure session flow.",
  },
  {
    number: "02",
    title: "Review your options",
    text: "Compare the Starter, Premium Growth and VIP Capital tiers using the built-in calculator.",
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

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/4 w-[32rem] h-[32rem] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute top-24 right-0 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              UK-focused investment platform
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
              A clearer way to invest, track and grow.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Trading Flow Capital brings investment plans, projected daily profit and transaction
              reporting into one straightforward dashboard built for UK investors who value
              visibility.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
              >
                Open investor portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#plans"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 text-slate-200 font-semibold text-sm transition"
              >
                View investment tiers
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-400">
              {["Transparent daily reporting", "Three defined plan terms", "UK support hours"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3">
              Why Trading Flow
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Designed to make investment details easier to understand
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
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
                  className="glass-card rounded-2xl p-5 border border-white/5"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">{benefit.title}</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">{benefit.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="plans" className="py-20 sm:py-24 bg-[#060A12] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-3">
                Investment tiers
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Defined terms before you commit
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
                Each tier shows its daily rate, fixed term, minimum allocation and capital-return
                terms. Use the dashboard calculator to see projected profit for a specific amount.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Open the calculator
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            {SITE_PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`relative rounded-2xl p-6 border flex flex-col ${
                  plan.featured
                    ? "bg-emerald-950/25 border-emerald-500/35 shadow-2xl shadow-emerald-500/10"
                    : "bg-[#0C1320] border-white/8"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.rate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-400 font-semibold uppercase">daily</span>
                </div>
                <dl className="mt-6 pt-5 border-t border-white/5 space-y-3 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Term</dt>
                    <dd className="font-semibold text-slate-200">{plan.duration} days</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Minimum</dt>
                    <dd className="font-semibold text-slate-200">
                      ${plan.minimum.toLocaleString("en-GB")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Capital return</dt>
                    <dd className="font-semibold text-emerald-400">At maturity</dd>
                  </div>
                </dl>
                <Link
                  href="/login"
                  className={`mt-7 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition ${
                    plan.featured
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  View in dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-5 text-[11px] text-slate-500">
            Plan rates are illustrative, not guaranteed, and do not represent a forecast. Capital
            is at risk.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Four steps from account to daily reporting
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {steps.map((step) => (
              <article key={step.number} className="glass-card rounded-2xl p-5 border border-white/5">
                <span className="text-xs font-bold text-emerald-400">{step.number}</span>
                <h3 className="mt-3 font-bold text-white text-sm">{step.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="py-20 sm:py-24 bg-[#060A12] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-3">
                Security & responsibility
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Clear records, protected access and honest expectations
              </h2>
              <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                Access is protected with HTTP-only signed sessions, passwords are hashed before
                storage, and every balance-changing action is written to the transaction ledger.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-200 text-xs font-semibold hover:border-emerald-500/30"
                >
                  About our approach
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
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
                  text: "The daily ROI process checks each active contract before crediting profit.",
                },
                {
                  icon: TrendingUp,
                  title: "Risk-aware presentation",
                  text: "Plan rates are shown as illustrative terms, never as guaranteed outcomes.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl bg-[#0C1320] border border-white/5 p-5">
                    <Icon className="w-5 h-5 text-emerald-400 mb-3" />
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h3 className="text-xl font-bold text-white">Ready to view your portfolio?</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Sign in to review plans, projected daily profit and account activity.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold whitespace-nowrap"
            >
              Investor login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
