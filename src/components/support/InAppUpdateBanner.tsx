"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";

interface AppVersion {
  versionName: string;
  versionCode: number;
  apkUrl: string;
}

function parseInstalledVersion(userAgent: string): number | null {
  const match = userAgent.match(/CoreChainAndroid\/(\d+\.\d+\.\d+)(?:\/(\d+))?/);
  if (!match) return null;
  const code = match[2] ? Number(match[2]) : Number.NaN;
  return Number.isFinite(code) && code > 0 ? code : null;
}

export default function InAppUpdateBanner() {
  const [update, setUpdate] = useState<AppVersion | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
    if (!userAgent.includes("CoreChainAndroid")) return;

    document.documentElement.classList.add("corechain-app");
    const installedCode = parseInstalledVersion(userAgent);

    fetch("/downloads/app-version.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data || typeof data.versionCode !== "number") return;
        const isOutdated = installedCode === null || data.versionCode > installedCode;
        if (!isOutdated) return;
        if (sessionStorage.getItem("corechain-update-dismissed") === String(data.versionCode)) {
          return;
        }
        setUpdate({
          versionName: typeof data.versionName === "string" ? data.versionName : "",
          versionCode: data.versionCode,
          apkUrl: typeof data.apkUrl === "string" ? data.apkUrl : "/downloads/corechain.apk",
        });
      })
      .catch(() => {});
  }, []);

  if (!update || dismissed) return null;

  const openUpdate = () => {
    const bridge = (window as unknown as { CoreChainApp?: { openInBrowser?: (url: string) => void } })
      .CoreChainApp;
    const target = update.apkUrl.startsWith("http")
      ? update.apkUrl
      : `${window.location.origin}${update.apkUrl}`;
    if (bridge?.openInBrowser) {
      bridge.openInBrowser(target);
    } else {
      window.location.href = target;
    }
  };

  const dismiss = () => {
    sessionStorage.setItem("corechain-update-dismissed", String(update.versionCode));
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-3 bg-[#160708]/95 px-4 py-2.5 text-center backdrop-blur">
      <p className="text-[11px] font-semibold text-white sm:text-xs">
        New CoreChain version {update.versionName} is available. Update to keep the latest investor
        and admin features.
      </p>
      <button
        type="button"
        onClick={openUpdate}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-yellow-400 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-black hover:bg-yellow-300"
      >
        Update
        <ArrowUpRight className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss update notice"
        className="shrink-0 rounded-lg p-1 text-white/60 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
