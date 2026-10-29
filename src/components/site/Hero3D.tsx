"use client";

import { useRef } from "react";
import type { PointerEvent } from "react";
import { ArrowUpRight, ShieldCheck, TrendingUp } from "lucide-react";
import styles from "./Hero3D.module.css";

export default function Hero3D() {
  const sceneRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scene = sceneRef.current;
    if (!scene) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    scene.style.setProperty("--rotate-y", `${(x * 10).toFixed(2)}deg`);
    scene.style.setProperty("--rotate-x", `${(-y * 8).toFixed(2)}deg`);
    scene.style.setProperty("--glow-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    scene.style.setProperty("--glow-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  };

  const resetTilt = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.style.setProperty("--rotate-y", "0deg");
    scene.style.setProperty("--rotate-x", "0deg");
    scene.style.setProperty("--glow-x", "50%");
    scene.style.setProperty("--glow-y", "42%");
  };

  return (
    <div
      id="hero-3d-scene"
      ref={sceneRef}
      className={styles.scene}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      aria-hidden="true"
    >
      <div className={styles.ambient} />
      <div className={styles.gridFloor} />
      <div className={styles.orbit}>
        <span className={styles.orbitDot} />
        <span className={styles.orbitDotAlt} />
      </div>

      <div className={styles.tilt}>
        <div className={styles.stage}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.brandMark}>
                <TrendingUp className={styles.brandIcon} />
              </div>
              <div className={styles.windowTitle}>
                <span>Portfolio overview</span>
                <small>Live account snapshot</small>
              </div>
              <span className={styles.liveBadge}>
                <span />
                Live
              </span>
            </div>

            <div className={styles.balanceBlock}>
              <span className={styles.eyebrow}>Total wallet balance</span>
              <div className={styles.balanceRow}>
                <strong>$24,580.45</strong>
                <span className={styles.growth}>
                  <ArrowUpRight />
                  18.3%
                </span>
              </div>
              <span className={styles.balanceCaption}>Available across your portfolio</span>
            </div>

            <div className={styles.chart}>
              <div className={styles.chartLabels}>
                <span>Growth trend</span>
                <span>Last 30 days</span>
              </div>
              <svg viewBox="0 0 340 104" className={styles.chartSvg}>
                <defs>
                  <linearGradient id="hero-3d-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="hero-3d-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#FACC15" />
                  </linearGradient>
                </defs>
                <path
                  className={styles.chartArea}
                  d="M0 86 C24 80 35 62 58 67 C83 73 92 44 118 50 C141 55 154 27 181 34 C206 40 219 17 248 23 C276 29 292 9 322 15 L340 12 L340 104 L0 104 Z"
                  fill="url(#hero-3d-area)"
                />
                <path
                  className={styles.chartLine}
                  d="M0 86 C24 80 35 62 58 67 C83 73 92 44 118 50 C141 55 154 27 181 34 C206 40 219 17 248 23 C276 29 292 9 322 15 L340 12"
                  fill="none"
                  stroke="url(#hero-3d-line)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle className={styles.chartPulse} cx="322" cy="15" r="4" fill="#FACC15" />
                <circle className={styles.chartHalo} cx="322" cy="15" r="9" fill="none" stroke="#FACC15" />
              </svg>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <span>Eligible deposits</span>
                <strong>$18,000.00</strong>
              </div>
              <div className={`${styles.stat} ${styles.statAccent}`}>
                <span>Daily profit</span>
                <strong>+$360.00</strong>
              </div>
            </div>

            <div className={styles.panelFooter}>
              <div className={styles.contracts}>
                <span className={styles.miniAvatar}>P</span>
                <span className={styles.miniAvatar}>S</span>
                <span className={styles.contractText}>2 active deposits</span>
              </div>
              <span className={styles.verified}>
                <ShieldCheck />
                Verified ledger
              </span>
            </div>
          </div>

          <div className={`${styles.floatingCard} ${styles.profitCard}`}>
            <span className={styles.floatLabel}>
              <TrendingUp />
              Daily profit
            </span>
            <strong className={styles.floatValue}>+$360.00</strong>
            <small>2% on eligible deposits</small>
          </div>

          <div className={`${styles.floatingCard} ${styles.planCard}`}>
            <span className={styles.floatLabel}>Daily 2% Plan</span>
            <div className={styles.planRate}>
              <strong>2.0%</strong>
              <span>daily</span>
            </div>
            <small>24-hour activation</small>
          </div>

          <div className={styles.orb}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <div className={styles.horizon} />
    </div>
  );
}
