import { DOMAIN_NAME, SITE_TITLE } from "@web/config";

/**
 * OG image configuration
 */
export const OG_CONFIG = {
  /** Standard OG image dimensions */
  width: 1200,
  height: 630,

  /** Font family (must match fonts.ts) */
  fontFamily: "Geist",

  /** Site name for branding */
  siteName: SITE_TITLE,

  /** Site URL for branding */
  siteUrl: DOMAIN_NAME,

  /** Border radius in pixels */
  borderRadius: 10,
} as const;

/** Exported size object for Next.js OG image metadata */
export const OG_SIZE = {
  width: OG_CONFIG.width,
  height: OG_CONFIG.height,
} as const;

/** Standard cache headers for static OG images */
export const OG_HEADERS = {
  "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
} as const;
