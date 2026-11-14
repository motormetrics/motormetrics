import { slugify } from "@motormetrics/utils/slugify";
import { Make } from "@web/lib/og/cards/make";
import {
  OG_CACHE_HEADERS,
  OG_CONTENT_TYPE,
  TWITTER_SIZE,
} from "@web/lib/og/config";
import { loadMake } from "@web/lib/og/data";
import { getOGFonts } from "@web/lib/og/fonts";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { getMakeTotalsInRange } from "@web/queries/cars/makes/period-totals";
import { ImageResponse } from "next/og";

interface ImageProps {
  params: Promise<{ make: string }>;
}

export const alt = "Car make registrations in Singapore - MotorMetrics";
export const size = TWITTER_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** How many of the year's largest makes are prerendered at build time. */
const PRERENDERED_MAKES = 10;

/**
 * Prerender only the cards of the year's largest makes, the same set as the
 * page. Every other make's card is rendered on its first request and cached.
 */
export async function generateStaticParams() {
  const month = await getCarsLatestMonth();
  const totals = month
    ? await getMakeTotalsInRange(`${month.slice(0, 4)}-01`, month)
    : [];
  const params = totals
    .slice(0, PRERENDERED_MAKES)
    .map(({ make }) => ({ make: slugify(make) }));

  return params.length > 0 ? params : [{ make: "__static-validation__" }];
}

export default async function Image({ params }: ImageProps) {
  const { make } = await params;
  const [data, fonts] = await Promise.all([loadMake(make), getOGFonts()]);

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(<Make height={size.height} {...data} />, {
    ...size,
    fonts,
    headers: OG_CACHE_HEADERS,
  });
}
