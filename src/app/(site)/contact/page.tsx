import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/site/ContactForm";
import { breadcrumbJsonLd, contactPageJsonLd, createPageMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Us",
  description:
    "Contact Trading Flow Capital by email, telephone or post. UK support hours are Monday to Friday, 09:00–17:00 GMT.",
  path: "/contact",
  keywords: ["contact Trading Flow Capital", "UK investment support", "investment platform contact"],
});

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            contactPageJsonLd(),
            breadcrumbJsonLd("Contact us", "/contact"),
          ]).replace(/</g, "\\u003c"),
        }}
      />

      <section className="border-b border-white/5 bg-[#060A12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-5">
            <Link href="/" className="hover:text-emerald-400">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-300">Contact us</span>
          </nav>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3">
              Contact us
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Talk to the Trading Flow team
            </h1>
            <p className="mt-5 text-base text-slate-300 leading-relaxed">
              For account, plan or technical questions, contact our UK support team using the
              details below or prepare an email through the enquiry form.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[
              {
                icon: MapPin,
                title: "Office",
                content: COMPANY.addressLine,
              },
              {
                icon: Mail,
                title: "Email",
                content: COMPANY.email,
                href: `mailto:${COMPANY.email}`,
              },
              {
                icon: Phone,
                title: "Telephone",
                content: COMPANY.phoneDisplay,
                href: `tel:${COMPANY.phone.replace(/\s/g, "")}`,
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
                  className="rounded-2xl border border-white/5 bg-[#0C1320] p-5 flex items-start gap-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {item.title}
                    </h2>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-1 block text-sm text-slate-200 hover:text-emerald-400 break-all"
                      >
                        {item.content}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-slate-200 leading-relaxed">{item.content}</p>
                    )}
                  </div>
                </div>
              );
            })}
            <p className="px-1 text-[11px] leading-relaxed text-slate-500">
              Demonstration contact details must be replaced with verified company information
              before this website is used publicly.
            </p>
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-[#0C1320] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white">Send an enquiry</h2>
            <p className="mt-1 text-xs text-slate-400 mb-6">
              Complete the fields below to prepare a message in your email application.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
