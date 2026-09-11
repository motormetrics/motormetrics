import { Parf } from "@web/lib/og/cards/parf";
import { OG_CONTENT_TYPE, OG_HEADERS, OG_SIZE } from "@web/lib/og/config";
import { getOGFonts } from "@web/lib/og/fonts";
import { ImageResponse } from "next/og";
import { connection } from "next/server";

export const alt = "PARF rebate calculator - MotorMetrics";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  await connection();

  const fonts = await getOGFonts();

  return new ImageResponse(<Parf height={size.height} />, {
    ...size,
    fonts,
    headers: OG_HEADERS,
  });
}
