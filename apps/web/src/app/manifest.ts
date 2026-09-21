import { SITE_DESCRIPTION, SITE_TITLE } from "@web/config";
import type { MetadataRoute } from "next";

/* Served at /manifest.webmanifest; Next emits the <link rel="manifest"> itself.
   The icons live in public/ rather than as app/icon* conventions because
   manifest entries are plain URLs, and convention files carry a content hash.
   Every raster is a full-bleed square on the cream ground — no baked-in radius,
   since each platform applies its own mask. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#F7F5EF",
    theme_color: "#16323F",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
