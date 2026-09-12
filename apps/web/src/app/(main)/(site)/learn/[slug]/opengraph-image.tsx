import { formatDate } from "@web/app/(main)/(site)/blog/components/post/utils";
import { Article } from "@web/lib/og/cards/article";
import { OG_CONTENT_TYPE, OG_SIZE } from "@web/lib/og/config";
import { getOGFonts } from "@web/lib/og/fonts";
import { ImageResponse } from "next/og";
import { connection } from "next/server";
import {
  getAllGuideSlugs,
  getGuideBySlug,
  getReadingMinutes,
} from "../lib/guides";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export const alt = "MotorMetrics guide";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: ImageProps) {
  await connection();

  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return new Response("Not found", { status: 404 });
  }

  const fonts = await getOGFonts();
  const byline = `${formatDate(new Date(guide.lastUpdated))} · ${getReadingMinutes(guide.content)} min read`;

  return new ImageResponse(
    <Article
      height={size.height}
      tag="Learn"
      byline={byline}
      title={guide.title}
      excerpt={guide.excerpt}
    />,
    {
      ...size,
      fonts,
    },
  );
}
