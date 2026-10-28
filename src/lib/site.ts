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
    streetAddress: "Demo House, 1 Example Street",
    addressLocality: "London",
    postalCode: "EC1A 1AA",
    addressCountry: "GB",
  },
  addressLine: "Demo House, 1 Example Street, London, EC1A 1AA, United Kingdom",
  email: "tradingflow.demo@gmail.com",
  // Ofcom reserves 020 7946 09xx numbers for fictional use.
  phone: "+44 20 7946 0958",
  phoneDisplay: "020 7946 0958",
  hours: "Monday to Friday, 09:00–17:00 GMT",
  effectiveDate: "28 October 2026",
};

export const SITE_PLANS = [
  {
    name: "Starter",
    rate: 1.5,
    duration: 15,
    minimum: 100,
    maximum: 999,
    description: "A short-term tier for learning how daily reporting works.",
  },
  {
    name: "Premium Growth",
    rate: 2.0,
    duration: 30,
    minimum: 1000,
    maximum: 9999,
    description: "Our core tier with a balanced term and daily profit visibility.",
    featured: true,
  },
  {
    name: "VIP Capital",
    rate: 3.0,
    duration: 60,
    minimum: 10000,
    maximum: 100000,
    description: "A longer-horizon tier for experienced, higher-value allocations.",
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
