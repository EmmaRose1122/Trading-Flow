import Link from "next/link";
import { Globe2, Mail } from "lucide-react";
import BrandLockup from "@/components/site/BrandLockup";
import { COMPANY, LEGAL_PAGES, PUBLIC_PAGES } from "@/lib/site";
import { PLATFORM_REFERRAL_CODE, displayReferralCode } from "@/lib/referral";

export default function SiteFooter() {
  return (
    <footer className="border-t border-red-900/20 bg-[#FFF5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-9">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex mb-4" aria-label={`${COMPANY.name} home`}>
              <BrandLockup iconSize={36} />
            </Link>
            <p className="text-xs text-[#5B1B1B] leading-relaxed max-w-xs">
              Digital-asset investing with Bitget execution connectivity, BEP20 settlement and a
              transparent investor ledger.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B0B0E] mb-4">
              Company
            </h2>
            <ul className="space-y-2.5 text-xs text-[#5B1B1B]">
              {PUBLIC_PAGES.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="hover:text-red-900 transition">
                    {page.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/download" className="hover:text-red-900 transition">
                  Android app
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-red-900 transition">
                  Investor login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B0B0E] mb-4">
              Legal
            </h2>
            <ul className="space-y-2.5 text-xs text-[#5B1B1B]">
              {LEGAL_PAGES.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="hover:text-red-900 transition">
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B0B0E] mb-4">
              Contact
            </h2>
            <address className="not-italic space-y-3 text-xs text-[#5B1B1B]">
              <p className="flex items-start gap-2">
                <Globe2 className="w-3.5 h-3.5 mt-0.5 text-red-800 shrink-0" />
                <span>
                  {COMPANY.singapore.label}
                  <br />
                  {COMPANY.singapore.locality} · Appointments only
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-800 shrink-0" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-red-900 break-all">
                  {COMPANY.email}
                </a>
              </p>
              <p className="text-[11px] text-[#6B1D1D]">{COMPANY.hours}</p>
              <p className="text-[11px] text-[#6B1D1D]">
                Invitation code:{" "}
                <span className="font-mono text-red-800">
                  {displayReferralCode(PLATFORM_REFERRAL_CODE)}
                </span>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-red-900/20 space-y-4">
          <p className="text-[11px] leading-relaxed text-[#6B1D1D]">
            <strong className="text-[#5B1B1B]">Risk warning:</strong> Investing carries risk.
            Capital is at risk and the value of investments can go down as well as up. Past
            performance and displayed plan rates are not a reliable indicator of future results.
            Nothing on this website constitutes financial, tax or legal advice.
          </p>
          <p className="text-[11px] leading-relaxed text-[#7F1D1D]">
            CoreChain is a digital-asset investment platform. Bitget is an independent third-party
            execution venue and does not guarantee CoreChain products. BEP20 settlement makes a
            payout verifiable after it is sent; it does not protect capital or guarantee returns.
            CoreChain does not claim authorisation or regulation by any financial regulator and does
            not offer regulated investment services.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#6B1D1D]">
            <p>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</p>
            <p>Singapore support desk · Appointments only</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
