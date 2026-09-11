import { SiteDefault } from "@web/lib/og/cards/site-default";
import { OG_CONTENT_TYPE, TWITTER_SIZE } from "@web/lib/og/config";
import { loadSiteDefault } from "@web/lib/og/data";
import { getOGFonts } from "@web/lib/og/fonts";
import { ImageResponse } from "next/og";
import { connection } from "next/server";

export const alt = "MotorMetrics - Singapore's car market, in numbers";
export const size = TWITTER_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  await connection();

  const [data, fonts] = await Promise.all([loadSiteDefault(), getOGFonts()]);

  return new ImageResponse(<SiteDefault height={size.height} {...data} />, {
    ...size,
    fonts,
  });
}
