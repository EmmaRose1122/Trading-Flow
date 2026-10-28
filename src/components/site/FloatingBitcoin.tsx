import type { CSSProperties } from "react";
import styles from "./FloatingBitcoin.module.css";

interface FloatingBitcoinProps {
  className?: string;
  size?: number;
  delay?: number;
  duration?: number;
  spinDuration?: number;
  opacity?: number;
}

export default function FloatingBitcoin({
  className = "",
  size = 54,
  delay = 0,
  duration = 9,
  spinDuration = 16,
  opacity = 0.38,
}: FloatingBitcoinProps) {
  const style = {
    "--btc-size": `${size}px`,
    "--btc-delay": `${delay}s`,
    "--btc-duration": `${duration}s`,
    "--btc-spin-duration": `${spinDuration}s`,
    "--btc-opacity": opacity,
  } as CSSProperties;

  return (
    <div className={`${styles.coin} ${className}`} style={style} aria-hidden="true">
      <div className={styles.halo} />
      <div className={styles.inner}>
        <div className={styles.face}>
          <span className={styles.symbol}>&#8383;</span>
        </div>
        <div className={`${styles.face} ${styles.back}`}>
          <span className={styles.symbol}>&#8383;</span>
        </div>
      </div>
    </div>
  );
}
