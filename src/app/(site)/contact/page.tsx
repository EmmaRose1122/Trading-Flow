import type { Metadata } from "next";
import { headers } from "next/headers";
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
  const nonce = headers().get("x-nonce") || undefined;
  return (
    <>
      <script
        nonce={nonce}
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
              Talk to the Trading Flow team
            </h1>
            <p className="mt-5 text-base text-[#3F1414] leading-relaxed">
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
              Demonstration contact details must be replaced with verified company information
              before this website is used publicly.
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
