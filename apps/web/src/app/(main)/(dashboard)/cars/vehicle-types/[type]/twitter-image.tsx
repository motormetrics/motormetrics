import { slugify } from "@motormetrics/utils/slugify";
import { Registrations } from "@web/lib/og/cards/registrations";
import { OG_CONTENT_TYPE, TWITTER_SIZE } from "@web/lib/og/config";
import { loadRegistrations } from "@web/lib/og/data";
import { getOGFonts } from "@web/lib/og/fonts";
import { getDistinctVehicleTypes } from "@web/queries/cars";
import { ImageResponse } from "next/og";
import { connection } from "next/server";

export const alt = "Latest car registrations in Singapore - MotorMetrics";
export const size = TWITTER_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  const types = await getDistinctVehicleTypes();
  const params = types.map(({ vehicleType }) => ({
    type: slugify(vehicleType),
  }));

  return params.length > 0 ? params : [{ type: "__static-validation__" }];
}

export default async function Image() {
  await connection();

  const [data, fonts] = await Promise.all([loadRegistrations(), getOGFonts()]);

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(<Registrations height={size.height} {...data} />, {
    ...size,
    fonts,
  });
}
