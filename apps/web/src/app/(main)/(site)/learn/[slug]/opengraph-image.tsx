import {
  getAllGuideSlugs,
  getGuideBySlug,
  getReadingMinutes,
} from "@web/app/(main)/(site)/learn/lib/guides";
import { Article } from "@web/lib/og/cards/article";
import { OG_CACHE_HEADERS, OG_CONTENT_TYPE, OG_SIZE } from "@web/lib/og/config";
import { getOGFonts } from "@web/lib/og/fonts";
import { formatDate } from "@web/utils/dates/format-date";
import { ImageResponse } from "next/og";

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
      headers: OG_CACHE_HEADERS,
    },
  );
}
