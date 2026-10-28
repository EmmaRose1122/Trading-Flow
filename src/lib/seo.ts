import type { Metadata } from "next";
import { COMPANY, SITE_URL } from "./site";

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
}: PageMetadataOptions): Metadata {
  const url = path === "/" ? "/" : path;
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_GB",
      url,
      siteName: COMPANY.name,
      title,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${COMPANY.name} — UK investment dashboard`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.legalName,
    alternateName: COMPANY.name,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    address: {
      "@type": "PostalAddress",
      ...COMPANY.address,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: COMPANY.email,
      telephone: COMPANY.phone,
      areaServed: "GB",
      availableLanguage: "English",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: COMPANY.name,
    url: SITE_URL,
    inLanguage: "en-GB",
    publisher: {
      "@type": "Organization",
      name: COMPANY.legalName,
    },
  };
}

export function breadcrumbJsonLd(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: `${SITE_URL}${path}`,
      },
    ],
  };
}

export function contactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${COMPANY.name}`,
    url: `${SITE_URL}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: COMPANY.legalName,
      email: COMPANY.email,
      telephone: COMPANY.phone,
      address: {
        "@type": "PostalAddress",
        ...COMPANY.address,
      },
    },
  };
}
