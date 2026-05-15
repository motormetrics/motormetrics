import { OG_HEADERS, OG_SIZE } from "@web/lib/og/config";
import { getOGFonts } from "@web/lib/og/fonts";
import { Article } from "@web/lib/og/templates/article";
import { ImageResponse } from "next/og";
import { getAllGuideSlugs, getGuideBySlug } from "../lib/guides";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export const size = OG_SIZE;

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return new Response("Not found", { status: 404 });
  }

  const fonts = getOGFonts();

  return new ImageResponse(<Article eyebrow="Learn" title={guide.title} />, {
    ...size,
    fonts,
    headers: OG_HEADERS,
  });
}
