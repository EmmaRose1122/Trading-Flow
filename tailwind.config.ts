import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080C15",
        surface: "#0F172A",
        card: "#131E35",
        border: "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "#10B981",
          hover: "#059669",
        },
        cyanAccent: {
          DEFAULT: "#06B6D4",
          glow: "rgba(6, 182, 212, 0.3)",
        },
      },
      boxShadow: {
        glow: "0 0 25px rgba(16, 185, 129, 0.2)",
        glowCyan: "0 0 25px rgba(6, 182, 212, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;

