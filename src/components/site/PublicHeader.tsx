"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Download, Menu, X } from "lucide-react";
import BrandLockup from "@/components/site/BrandLockup";
import { COMPANY, LEGAL_PAGES, PUBLIC_PAGES } from "@/lib/site";

export default function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-red-900/20 bg-[#FFFFFF]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label={`${COMPANY.name} home`}
          >
            <BrandLockup priority />
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
                      ? "text-red-800 bg-red-100"
                      : "text-[#3F1414] hover:text-[#2B0B0E] hover:bg-rose-50"
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
              className="p-2 rounded-lg text-[#5B1B1B] hover:text-red-900 hover:bg-red-200 transition"
              aria-label="Download Android app"
            >
              <Download className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition shadow-lg shadow-red-900/20"
            >
              Investor login
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="lg:hidden flex items-center">
            <Link
              href="/download"
              className="p-2 rounded-lg text-[#5B1B1B] hover:text-red-900"
              aria-label="Download Android app"
            >
              <Download className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="p-2 rounded-lg text-[#3F1414] hover:text-[#2B0B0E] hover:bg-rose-50"
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
          className="lg:hidden border-t border-red-900/20 bg-[#FFF7F7] px-4 py-4 space-y-1"
        >
          {PUBLIC_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname === page.href
                  ? "text-red-800 bg-red-100"
                  : "text-[#3F1414] hover:bg-rose-50"
              }`}
            >
              {page.name}
            </Link>
          ))}
          <div className="pt-3 mt-2 border-t border-red-900/20 grid grid-cols-2 gap-2">
            {LEGAL_PAGES.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 text-xs text-[#5B1B1B] hover:text-[#2B0B0E]"
              >
                {page.name}
              </Link>
            ))}
          </div>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-700 text-white text-sm font-bold"
          >
            Investor login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </nav>
      )}
    </header>
  );
}
