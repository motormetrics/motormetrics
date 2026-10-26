import { Registrations } from "@web/lib/og/cards/registrations";
import { OG_CACHE_HEADERS, OG_CONTENT_TYPE, OG_SIZE } from "@web/lib/og/config";
import { loadRegistrations } from "@web/lib/og/data";
import { getOGFonts } from "@web/lib/og/fonts";
import { ImageResponse } from "next/og";

export const alt = "Car make comparison in Singapore - MotorMetrics";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * The page sets its own `openGraph`, which drops the image inherited from
 * `cars/makes`, so it carries the same Registrations card here.
 */
export default async function Image() {
  const [data, fonts] = await Promise.all([loadRegistrations(), getOGFonts()]);

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(<Registrations height={size.height} {...data} />, {
    ...size,
    fonts,
    headers: OG_CACHE_HEADERS,
  });
}
