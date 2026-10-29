export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://trading-flow-capital.vercel.app"
).replace(/\/$/, "");

export const COMPANY = {
  name: "Trading Flow Capital",
  legalName: "Trading Flow Capital Ltd",
  shortName: "Trading Flow",
  tagline: "UK-focused investing with clearer daily reporting",
  description:
    "Trading Flow Capital is a UK-focused investment dashboard for tracking plans, daily profit, deposits, withdrawals and portfolio activity.",
  address: {
    streetAddress: "4 Andrews Close, Formby",
    addressLocality: "Liverpool",
    postalCode: "L37 2YH",
    addressCountry: "GB",
  },
  addressLine: "4 Andrews Close, Formby, Liverpool, L37 2YH, United Kingdom",
  email: "tradingflow.demo@gmail.com",
  phone: "+44 1704 834099",
  phoneDisplay: "01704 834099",
  hours: "Monday to Friday, 09:00–17:00 GMT",
  effectiveDate: "28 October 2026",
};

export const SITE_PLANS = [
  {
    name: "Daily 2% Plan",
    rate: 2.0,
    duration: 0,
    minimum: 10,
    maximum: null,
    description: "One simple plan. Deposit from $10, add funds any time and earn 2% every 24 hours.",
    featured: true,
  },
];

export const PUBLIC_PAGES = [
  { name: "Home", href: "/" },
  { name: "About us", href: "/about" },
  { name: "Contact us", href: "/contact" },
];

export const LEGAL_PAGES = [
  { name: "Privacy policy", href: "/privacy" },
  { name: "Cookie policy", href: "/cookies" },
  { name: "Disclaimer", href: "/disclaimer" },
];
