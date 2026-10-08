import { Article } from "@web/lib/og/cards/article";
import { OG_CACHE_HEADERS, OG_CONTENT_TYPE, OG_SIZE } from "@web/lib/og/config";
import { getOGFonts } from "@web/lib/og/fonts";
import { ImageResponse } from "next/og";

export const alt = "LTA's COE category merger proposal - MotorMetrics";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const fonts = await getOGFonts();

  return new ImageResponse(
    <Article
      byline="LTA public consultation · closes 2 Nov 2026"
      excerpt="Cat A and B would merge into one category, with a rebate or surcharge of up to $15,000 based on the car's value."
      height={size.height}
      tag="COE"
      title="LTA proposes merging COE Categories A and B"
    />,
    {
      ...size,
      fonts,
      headers: OG_CACHE_HEADERS,
    },
  );
}
