import { OG_HEADERS, OG_SIZE } from "@web/lib/og/config";
import { getOGFonts } from "@web/lib/og/fonts";
import { Article } from "@web/lib/og/templates/article";
import { getAllPosts, getPostBySlug } from "@web/queries/posts";
import { ImageResponse } from "next/og";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export const size = OG_SIZE;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const fonts = getOGFonts();

  return new ImageResponse(<Article eyebrow="Blog" title={post.title} />, {
    ...size,
    fonts,
    headers: OG_HEADERS,
  });
}
