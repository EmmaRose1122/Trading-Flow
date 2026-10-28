"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Layers,
  Receipt,
  Users,
  ShieldCheck,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Wallet,
  Download,
  Settings,
  UserCircle,
} from "lucide-react";
import BrandLockup from "@/components/site/BrandLockup";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
}

export default function Navbar({ user, onOpenDeposit, onOpenWithdraw }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Plans", href: "/plans", icon: Layers },
    { name: "Transactions", href: "/transactions", icon: Receipt },
    { name: "Referrals", href: "/referrals", icon: Users },
  ];

  if (user?.role === "ADMIN") {
    navLinks.push({ name: "Admin Portal", href: "/admin", icon: ShieldCheck });
  }

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#080C15]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" aria-label="Trading Flow Capital dashboard">
            <BrandLockup />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Controls & Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {onOpenDeposit && (
                  <button
                    onClick={onOpenDeposit}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs tracking-wide hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Deposit
                  </button>
                )}

                {onOpenWithdraw && (
                  <button
                    onClick={onOpenWithdraw}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white font-medium text-xs border border-white/5 hover:border-white/10 transition-all active:scale-95"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Withdraw
                  </button>
                )}

                <Link
                  href="/download"
                  title="Download Android app"
                  aria-label="Download Android app"
                  className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                >
                  <Download className="w-4 h-4" />
                </Link>

                <div className="h-5 w-px bg-white/10 mx-1" />

                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-left hover:opacity-80 transition"
                  title="Open profile"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-xs">
                    <p className="font-medium text-slate-200 leading-tight">{user.name}</p>
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                      {user.role}
                    </span>
                  </div>
                </Link>

                <Link
                  href="/settings"
                  title="Account settings"
                  aria-label="Account settings"
                  className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                >
                  <Settings className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 transition shadow-sm shadow-emerald-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            {user && (
              <Link
                href="/profile"
                aria-label="Open profile"
                className="w-8 h-8 mr-1 rounded-full bg-slate-800 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400"
              >
                {user.name.charAt(0)}
              </Link>
            )}
            <Link
              href="/download"
              aria-label="Download Android app"
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
            >
              <Download className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#0B0F19] px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? "bg-emerald-500/10 text-emerald-400" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/download"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            <Download className="w-4 h-4" />
            Download Android App
          </Link>
          {user ? (
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Signed in as {user.name}</span>
                <span className="text-emerald-400 uppercase font-semibold">{user.role}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-white/10 rounded-lg"
                >
                  <UserCircle className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-white/10 rounded-lg"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
              {(onOpenDeposit || onOpenWithdraw) && (
                <div className="grid grid-cols-2 gap-2">
                  {onOpenDeposit && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenDeposit();
                      }}
                      className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 rounded-lg"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Deposit
                    </button>
                  )}
                  {onOpenWithdraw && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenWithdraw();
                      }}
                      className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-white/10 rounded-lg"
                    >
                      <Wallet className="w-4 h-4" />
                      Withdraw
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-medium text-slate-200 bg-slate-800 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-semibold text-slate-950 bg-emerald-500 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>

      {user && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-[#080C15]/95 backdrop-blur-xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div
            className="grid h-16"
            style={{ gridTemplateColumns: `repeat(${navLinks.length}, minmax(0, 1fr))` }}
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 transition-colors ${
                    isActive ? "text-emerald-400" : "text-slate-500 hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-0 h-0.5 w-8 rounded-full bg-emerald-400" />
                  )}
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold truncate max-w-full">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}

