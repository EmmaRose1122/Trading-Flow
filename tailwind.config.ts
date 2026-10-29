import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

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
        background: "#FFFFFF",
        surface: "#FFF7F7",
        card: "#FFFFFF",
        border: "rgba(127, 29, 29, 0.12)",
        primary: {
          DEFAULT: "#DC2626",
          hover: "#B91C1C",
        },
        cyanAccent: {
          DEFAULT: "#E11D48",
          glow: "rgba(225, 29, 72, 0.25)",
        },
        emerald: colors.red,
        cyan: colors.rose,
        indigo: colors.red,
        teal: colors.red,
      },
      boxShadow: {
        glow: "0 0 25px rgba(220, 38, 38, 0.18)",
        glowCyan: "0 0 25px rgba(225, 29, 72, 0.18)",
      },
    },
  },
  plugins: [],
};
export default config;

