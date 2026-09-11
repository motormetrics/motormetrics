import { CoeResults } from "@web/lib/og/cards/coe-results";
import { OG_CONTENT_TYPE, OG_SIZE } from "@web/lib/og/config";
import { loadCoeResults } from "@web/lib/og/data";
import { getOGFonts } from "@web/lib/og/fonts";
import { ImageResponse } from "next/og";
import { connection } from "next/server";

export const alt = "Latest COE bidding results - MotorMetrics";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  await connection();

  const [data, fonts] = await Promise.all([loadCoeResults(), getOGFonts()]);

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(<CoeResults height={size.height} {...data} />, {
    ...size,
    fonts,
  });
}
