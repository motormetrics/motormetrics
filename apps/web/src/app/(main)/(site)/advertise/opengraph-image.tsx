import { OG_HEADERS, OG_SIZE } from "@web/lib/og/config";
import { getOGFonts } from "@web/lib/og/fonts";
import { Section } from "@web/lib/og/templates/section";
import { ImageResponse } from "next/og";

export const alt = "Advertise on MotorMetrics";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  const fonts = getOGFonts();

  return new ImageResponse(
    <Section
      eyebrow="Advertising"
      headlineTop="Reach Singapore's"
      headlineBottom="Car Enthusiasts"
      description="Put your product in front of an engaged audience actively researching Singapore's automotive market. Transparent analytics, simple pricing."
    />,
    {
      ...size,
      fonts,
      headers: OG_HEADERS,
    },
  );
}
