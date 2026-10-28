"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Download, Menu, TrendingUp, X } from "lucide-react";
import { COMPANY, LEGAL_PAGES, PUBLIC_PAGES } from "@/lib/site";

export default function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080C15]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label={`${COMPANY.name} home`}
          >
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-slate-950" />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight text-white leading-none">
                TRADING<span className="text-emerald-400">FLOW</span>
              </span>
              <span className="block text-[9px] tracking-[0.2em] uppercase text-slate-400 mt-1">
                Capital · United Kingdom
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {PUBLIC_PAGES.map((page) => {
              const active = pathname === page.href;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {page.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/download"
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
              aria-label="Download Android app"
            >
              <Download className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20"
            >
              Investor login
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="lg:hidden flex items-center">
            <Link
              href="/download"
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-400"
              aria-label="Download Android app"
            >
              <Download className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              aria-expanded={menuOpen}
              aria-controls="public-mobile-menu"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="public-mobile-menu"
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-white/10 bg-[#0B0F19] px-4 py-4 space-y-1"
        >
          {PUBLIC_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname === page.href
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {page.name}
            </Link>
          ))}
          <div className="pt-3 mt-2 border-t border-white/10 grid grid-cols-2 gap-2">
            {LEGAL_PAGES.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                {page.name}
              </Link>
            ))}
          </div>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold"
          >
            Investor login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </nav>
      )}
    </header>
  );
}
