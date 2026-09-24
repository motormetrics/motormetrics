import { FuelMix } from "@web/lib/og/cards/fuel-mix";
import {
  OG_CACHE_HEADERS,
  OG_CONTENT_TYPE,
  TWITTER_SIZE,
} from "@web/lib/og/config";
import { loadFuelMix } from "@web/lib/og/data";
import { getOGFonts } from "@web/lib/og/fonts";
import { ImageResponse } from "next/og";

export const alt = "Fuel-type share of new registrations - MotorMetrics";
export const size = TWITTER_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const [data, fonts] = await Promise.all([loadFuelMix(), getOGFonts()]);

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(<FuelMix height={size.height} {...data} />, {
    ...size,
    fonts,
    headers: OG_CACHE_HEADERS,
  });
}
