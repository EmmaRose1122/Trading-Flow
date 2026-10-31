export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://trading-flow-capital.vercel.app"
).replace(/\/$/, "");

export const COMPANY = {
  name: "CoreChain",
  legalName: "CoreChain",
  shortName: "CoreChain",
  tagline: "Digital asset investing with transparent on-chain settlement",
  description:
    "CoreChain is a digital-asset investment platform with Bitget execution connectivity, BEP20 settlement and a real-time investor ledger.",
  address: {
    addressLocality: "Singapore",
    addressCountry: "SG",
  },
  addressLine: "Singapore · Appointments only",
  singapore: {
    label: "Singapore support desk",
    locality: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    timezone: "SGT (UTC+8)",
  },
  email: "corechain@gmail.com",
  phone: "",
  phoneDisplay: "",
  hours: "Appointments only · SGT (UTC+8)",
  effectiveDate: "31 October 2026",
};

export const EXECUTION = {
  venue: "Bitget",
  venueUrl: "https://www.bitget.com",
  label: "Authorised execution connectivity",
  summary:
    "CoreChain routes digital-asset orders through Bitget's exchange infrastructure. Bitget provides the execution venue; CoreChain records the resulting position, settlement and ledger entries.",
};

export const BLOCKCHAIN = {
  network: "BNB Smart Chain",
  standard: "BEP20",
  chainId: 56,
  explorer: "https://bscscan.com",
  tokenSymbol: "USDT",
  tokenContract: "0x55d398326f99059fF775485246999027B3197955",
  confirmations: 1,
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
  { name: "Markets", href: "/markets" },
  { name: "Technology", href: "/technology" },
  { name: "About us", href: "/about" },
  { name: "Contact us", href: "/contact" },
];

export const LEGAL_PAGES = [
  { name: "Privacy policy", href: "/privacy" },
  { name: "Cookie policy", href: "/cookies" },
  { name: "Disclaimer", href: "/disclaimer" },
];
