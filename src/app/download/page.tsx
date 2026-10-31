import type { Metadata } from "next";
import Link from "next/link";
import appVersion from "../../../public/downloads/app-version.json";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import BrandLockup from "@/components/site/BrandLockup";

export const metadata: Metadata = {
  title: "Download Android App",
  description: "Install the CoreChain Android app for a faster mobile dashboard experience.",
};

const installSteps = [
  "Download the CoreChain APK on your Android phone.",
  "If prompted, allow installation from this browser in Android settings.",
  "Open the APK and tap Install.",
  "Sign in with your registered CoreChain account.",
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <header className="border-b border-red-900/20 bg-[#FFFFFF]/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="CoreChain home">
            <BrandLockup iconSize={36} />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#5B1B1B] hover:text-[#2B0B0E] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-400 mb-5">
              <Smartphone className="w-3.5 h-3.5" />
              Android App
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2B0B0E] tracking-tight leading-tight">
              CoreChain in your pocket
            </h1>
            <p className="mt-4 text-sm text-[#5B1B1B] leading-relaxed">
              Install the Android app for quick access to your portfolio, daily profit breakdown,
              investment plans, deposits and withdrawal requests.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href="/downloads/corechain.apk"
                download="corechain.apk"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm transition shadow-lg shadow-red-900/20 active:scale-[0.98]"
              >
                <Download className="w-5 h-5" />
                Download APK
              </a>
              <p className="text-[11px] text-[#6B1D1D]">
                Version {appVersion.versionName} · Android 7.0+ ·{" "}
                {(appVersion.sizeBytes / 1024).toFixed(0)} KB · Signed build
              </p>
              <p className="text-[10px] text-[#7F1D1D] font-mono break-all">
                SHA-256: {appVersion.sha256}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-red-900/20 bg-rose-50 p-4">
                <RefreshCw className="w-5 h-5 text-red-800 mb-2" />
                <h2 className="text-sm font-semibold text-[#2B0B0E]">Always up to date</h2>
                <p className="mt-1 text-xs text-[#5B1B1B] leading-relaxed">
                  The app loads the latest deployed website automatically, so new dashboard updates
                  appear without reinstalling the APK.
                </p>
              </div>
              <div className="rounded-xl border border-red-900/20 bg-rose-50 p-4">
                <ShieldCheck className="w-5 h-5 text-red-800 mb-2" />
                <h2 className="text-sm font-semibold text-[#2B0B0E]">Secure sign-in</h2>
                <p className="mt-1 text-xs text-[#5B1B1B] leading-relaxed">
                  Your registered account signs in through the encrypted CoreChain session flow.
                  Shortcut logins are not available.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border-red-900/20">
            <div className="flex items-center gap-3 pb-5 border-b border-red-900/20">
              <div className="w-12 h-12 rounded-2xl bg-white border border-red-900/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-red-800" />
              </div>
              <div>
                <h2 className="font-bold text-[#2B0B0E]">Installation guide</h2>
                <p className="text-xs text-[#5B1B1B]">Usually takes less than one minute.</p>
              </div>
            </div>
            <ol className="mt-5 space-y-4">
              {installSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-100 border border-red-400 text-red-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-xs text-[#3F1414] leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 pt-5 border-t border-red-900/20">
              <p className="text-[11px] text-[#6B1D1D] leading-relaxed">
                For Play Store distribution, sign the release APK with your permanent production
                keystore. Keep that keystore private and backed up.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
