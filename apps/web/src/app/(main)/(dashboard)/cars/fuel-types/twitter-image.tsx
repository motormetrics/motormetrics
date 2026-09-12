import { FuelMix } from "@web/lib/og/cards/fuel-mix";
import { OG_CONTENT_TYPE, TWITTER_SIZE } from "@web/lib/og/config";
import { loadFuelMix } from "@web/lib/og/data";
import { getOGFonts } from "@web/lib/og/fonts";
import { ImageResponse } from "next/og";
import { connection } from "next/server";

export const alt = "Fuel-type share of new registrations - MotorMetrics";
export const size = TWITTER_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  await connection();

  const [data, fonts] = await Promise.all([loadFuelMix(), getOGFonts()]);

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(<FuelMix height={size.height} {...data} />, {
    ...size,
    fonts,
  });
}
