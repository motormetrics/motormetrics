import { SITE_TITLE } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";

/**
 * Open Graph fields every page shares. Next.js merges metadata shallowly, so a
 * page that sets its own `openGraph` replaces the layout's whole object; spread
 * this first to keep these fields.
 */
export const baseOpenGraph = {
  siteName: SITE_TITLE,
  locale: "en_SG",
  type: "website",
} as const;

/** Twitter card fields every page shares; spread first, like `baseOpenGraph`. */
export const baseTwitter = {
  card: "summary_large_image",
  site: SOCIAL_HANDLE,
  creator: SOCIAL_HANDLE,
} as const;
