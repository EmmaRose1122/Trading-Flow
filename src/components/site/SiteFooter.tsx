import Link from "next/link";
import { Mail, MapPin, Phone, TrendingUp } from "lucide-react";
import { COMPANY, LEGAL_PAGES, PUBLIC_PAGES } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#060A12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-9">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-slate-950" />
              </span>
              <span className="font-bold tracking-tight text-white">
                TRADING<span className="text-emerald-400">FLOW</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              A UK-focused investment dashboard for transparent plans, daily reporting and
              portfolio oversight.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Company
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {PUBLIC_PAGES.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="hover:text-emerald-400 transition">
                    {page.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/download" className="hover:text-emerald-400 transition">
                  Android app
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition">
                  Investor login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Legal
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {LEGAL_PAGES.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="hover:text-emerald-400 transition">
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Contact
            </h2>
            <address className="not-italic space-y-3 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                <span>{COMPANY.addressLine}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-emerald-400 break-all">
                  {COMPANY.email}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="hover:text-emerald-400">
                  {COMPANY.phoneDisplay}
                </a>
              </p>
              <p className="text-[11px] text-slate-500">{COMPANY.hours}</p>
            </address>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            <strong className="text-slate-400">Risk warning:</strong> Investing carries risk.
            Capital is at risk and the value of investments can go down as well as up. Past
            performance and displayed plan rates are not a reliable indicator of future results.
            Nothing on this website constitutes financial, tax or legal advice.
          </p>
          <p className="text-[11px] leading-relaxed text-slate-600">
            Trading Flow Capital Ltd is a fictional demonstration company for this platform.
            Company address and contact details are placeholders. It is not authorised or regulated
            by the Financial Conduct Authority and does not offer regulated investment services.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</p>
            <p>London, United Kingdom</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
