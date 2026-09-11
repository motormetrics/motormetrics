import { slugify } from "@motormetrics/utils/slugify";
import { Make } from "@web/lib/og/cards/make";
import { OG_CONTENT_TYPE, OG_SIZE } from "@web/lib/og/config";
import { loadMake } from "@web/lib/og/data";
import { getOGFonts } from "@web/lib/og/fonts";
import { getDistinctMakes } from "@web/queries/cars";
import { ImageResponse } from "next/og";
import { connection } from "next/server";

interface ImageProps {
  params: Promise<{ make: string }>;
}

export const alt = "Car make registrations in Singapore - MotorMetrics";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  const makes = await getDistinctMakes();
  const params = makes.map(({ make }) => ({ make: slugify(make) }));

  return params.length > 0 ? params : [{ make: "__static-validation__" }];
}

export default async function Image({ params }: ImageProps) {
  await connection();

  const { make } = await params;
  const [data, fonts] = await Promise.all([loadMake(make), getOGFonts()]);

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(<Make height={size.height} {...data} />, {
    ...size,
    fonts,
  });
}
