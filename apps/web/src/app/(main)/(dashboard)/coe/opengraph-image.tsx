import { CoePremiums } from "@web/lib/og/cards/coe-premiums";
import { OG_CONTENT_TYPE, OG_SIZE } from "@web/lib/og/config";
import { loadCoePremiums } from "@web/lib/og/data";
import { getOGFonts } from "@web/lib/og/fonts";
import { ImageResponse } from "next/og";
import { connection } from "next/server";

export const alt = "Cat A and Cat B COE premiums - MotorMetrics";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  await connection();

  const [data, fonts] = await Promise.all([loadCoePremiums(), getOGFonts()]);

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(<CoePremiums height={size.height} {...data} />, {
    ...size,
    fonts,
  });
}
