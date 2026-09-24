import {
  getCategoryConfig,
  getReadingTime,
} from "@web/app/(main)/(site)/blog/components/post/utils";
import { Article } from "@web/lib/og/cards/article";
import { OG_CACHE_HEADERS, OG_CONTENT_TYPE, OG_SIZE } from "@web/lib/og/config";
import { getOGFonts } from "@web/lib/og/fonts";
import { getAllPosts, getPostBySlug } from "@web/queries/posts";
import { formatDate } from "@web/utils/dates/format-date";
import { ImageResponse } from "next/og";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export const alt = "MotorMetrics blog post";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  const [post, fonts] = await Promise.all([getPostBySlug(slug), getOGFonts()]);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const published = post.publishedAt ? formatDate(post.publishedAt) : "";
  const byline = `${published} · ${getReadingTime(post)} min read`;

  return new ImageResponse(
    <Article
      height={size.height}
      tag={getCategoryConfig(post).label}
      byline={byline}
      title={post.title}
      excerpt={post.excerpt ?? undefined}
    />,
    {
      ...size,
      fonts,
      headers: OG_CACHE_HEADERS,
    },
  );
}
