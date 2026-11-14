import { SITE_TITLE } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { OG_SIZE } from "@web/lib/og/config";

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

const cardImages = (url: string, alt: string) => [{ url, ...OG_SIZE, alt }];

/**
 * The shared site card, for pages without a card of their own. A page that
 * sets `openGraph` inherits no image from the root segment, so it names one of
 * these; Next.js reuses it for `twitter:image`.
 */
export const siteCardImages = cardImages(
  "/opengraph-image",
  "MotorMetrics - Singapore's car market, in numbers",
);

/**
 * Static section cards in `public/og`: one per section, shared by its index
 * and detail pages, so sharing a page costs no render.
 */
export const makesCardImages = cardImages(
  "/og/makes.png",
  "New car registrations by make - MotorMetrics",
);
export const compareMakesCardImages = cardImages(
  "/og/compare-makes.png",
  "Compare car makes side by side - MotorMetrics",
);
export const fuelTypesCardImages = cardImages(
  "/og/fuel-types.png",
  "Petrol, hybrid and electric, by the numbers - MotorMetrics",
);
export const vehicleTypesCardImages = cardImages(
  "/og/vehicle-types.png",
  "SUVs, sedans, hatchbacks and more - MotorMetrics",
);
export const learnCardImages = cardImages(
  "/og/learn.png",
  "Guides to buying and owning a car in Singapore - MotorMetrics",
);
