import { OG_HEADERS, OG_SIZE } from "@web/lib/og/config";
import { getOGFonts } from "@web/lib/og/fonts";
import { Section } from "@web/lib/og/templates/section";
import { ImageResponse } from "next/og";

export const alt = "About MotorMetrics";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  const fonts = getOGFonts();

  return new ImageResponse(
    <Section
      eyebrow="Behind the Data"
      headlineTop="The Story Behind"
      headlineBottom="MotorMetrics"
      description="A platform for exploring Singapore car registration statistics, COE bidding results, and market data. Built to make car market information easier to find and understand."
    />,
    {
      ...size,
      fonts,
      headers: OG_HEADERS,
    },
  );
}
