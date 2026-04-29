import { OG_HEADERS, OG_SIZE } from "@web/lib/og/config";
import { getOGFonts } from "@web/lib/og/fonts";
import { Section } from "@web/lib/og/templates/section";
import { ImageResponse } from "next/og";

export const alt = "MotorMetrics - Singapore Car Registration & COE Statistics";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  const fonts = getOGFonts();

  return new ImageResponse(
    <Section
      eyebrow="Singapore Car Market Data"
      headlineTop="Car & COE"
      headlineBottom="Trends"
      description="Latest statistics from Land Transport Authority with interactive charts, market analysis, and AI-powered insights."
    />,
    {
      ...size,
      fonts,
      headers: OG_HEADERS,
    },
  );
}
