import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${COMPANY.name} Investor Portal`,
    short_name: COMPANY.shortName,
    description: COMPANY.description,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#080C15",
    theme_color: "#080C15",
    lang: "en-GB",
    icons: [
      {
        src: "/brand/favicon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/favicon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
