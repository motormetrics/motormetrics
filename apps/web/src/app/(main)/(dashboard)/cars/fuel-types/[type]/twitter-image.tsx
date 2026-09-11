import { slugify } from "@motormetrics/utils/slugify";
import { FuelMix } from "@web/lib/og/cards/fuel-mix";
import { OG_CONTENT_TYPE, TWITTER_SIZE } from "@web/lib/og/config";
import { loadFuelMix } from "@web/lib/og/data";
import { getOGFonts } from "@web/lib/og/fonts";
import { getDistinctFuelTypes } from "@web/queries/cars";
import { ImageResponse } from "next/og";
import { connection } from "next/server";

export const alt = "Fuel-type share of new registrations - MotorMetrics";
export const size = TWITTER_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  const types = await getDistinctFuelTypes();
  const params = types.map(({ fuelType }) => ({ type: slugify(fuelType) }));

  return params.length > 0 ? params : [{ type: "__static-validation__" }];
}

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
