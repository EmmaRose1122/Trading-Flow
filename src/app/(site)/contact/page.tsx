import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Clock, Globe2, Mail } from "lucide-react";
import ContactForm from "@/components/site/ContactForm";
import { breadcrumbJsonLd, contactPageJsonLd, createPageMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Us",
  description:
    "Contact CoreChain by email or arrange an appointment with the Singapore support desk. BEP20 transaction questions can include the on-chain transaction hash.",
  path: "/contact",
  keywords: [
    "contact CoreChain",
    "Bitget execution support",
    "BEP20 withdrawal support",
    "Singapore support desk",
  ],
});

export default function ContactPage() {
  const nonce = headers().get("x-nonce") || undefined;
  return (
    <>
      <script
        nonce={nonce}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            contactPageJsonLd(),
            breadcrumbJsonLd("Contact us", "/contact"),
          ]).replace(/</g, "\\u003c"),
        }}
      />

      <section className="border-b border-red-900/20 bg-[#FFF5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <nav aria-label="Breadcrumb" className="text-xs text-[#6B1D1D] mb-5">
            <Link href="/" className="hover:text-red-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#3F1414]">Contact us</span>
          </nav>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800 mb-3">
              Contact us
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2B0B0E]">
              Talk to the CoreChain team
            </h1>
            <p className="mt-5 text-base text-[#3F1414] leading-relaxed">
              For account, Bitget execution, BEP20 settlement or verification questions, contact
              the CoreChain team or arrange an appointment with the Singapore support desk using the
              details below.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[
              {
                icon: Globe2,
                title: "Singapore support desk",
                content: `${COMPANY.singapore.locality} · Appointments only · ${COMPANY.singapore.timezone}`,
              },
              {
                icon: Mail,
                title: "Email",
                content: COMPANY.email,
                href: `mailto:${COMPANY.email}`,
              },
              {
                icon: Clock,
                title: "Support hours",
                content: COMPANY.hours,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-red-900/20 bg-white p-5 flex items-start gap-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-400 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-red-800" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#5B1B1B]">
                      {item.title}
                    </h2>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-1 block text-sm text-[#2B0B0E] hover:text-red-900 break-all"
                      >
                        {item.content}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-[#2B0B0E] leading-relaxed">{item.content}</p>
                    )}
                  </div>
                </div>
              );
            })}
            <p className="px-1 text-[11px] leading-relaxed text-[#6B1D1D]">
              The Singapore desk is an appointment-based support function. No walk-in office
              address is published. BEP20 transaction questions should include the transaction hash
              shown in your dashboard.
            </p>
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-red-900/20 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#2B0B0E]">Send an enquiry</h2>
            <p className="mt-1 text-xs text-[#5B1B1B] mb-6">
              Complete the fields below to prepare a message in your email application.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
