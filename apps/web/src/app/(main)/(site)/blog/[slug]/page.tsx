import { Button, Card, Separator } from "@heroui/react";
import { BlogHero } from "@web/app/(main)/(site)/blog/components/blog-hero";
import {
  type Highlight,
  KeyHighlights,
} from "@web/app/(main)/(site)/blog/components/key-highlights";
import { mdxComponents } from "@web/app/(main)/(site)/blog/components/mdx-components";
import { PostNavigation } from "@web/app/(main)/(site)/blog/components/post-navigation";
import { ProgressBar } from "@web/app/(main)/(site)/blog/components/progress-bar";
import { RelatedPosts } from "@web/app/(main)/(site)/blog/components/related-posts";
import { ShareButtons } from "@web/app/(main)/(site)/blog/components/share-buttons";
import { TableOfContents } from "@web/app/(main)/(site)/blog/components/table-of-contents";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { getPostViewCount } from "@web/lib/data/posts";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import {
  getAllPosts,
  getNextPost,
  getPostBySlug,
  getPreviousPost,
} from "@web/queries/posts";
import { Undo2 } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import readingTime from "reading-time";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import type { BlogPosting, WithContext } from "schema-dts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const canonical = `/blog/${post.slug}`;

  const publishedDate = post.publishedAt ?? post.createdAt;
  const modifiedDate = post.modifiedAt;

  return {
    title: post.title,
    description: post.excerpt || "",
    keywords: post.tags ?? [],
    authors: [{ name: `${SITE_TITLE} AI`, url: SITE_URL }],
    creator: SITE_TITLE,
    publisher: SITE_TITLE,
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      type: "article",
      publishedTime: publishedDate.toISOString(),
      modifiedTime: modifiedDate.toISOString(),
      authors: [SITE_TITLE],
      tags: post.tags ?? [],
      url: `${SITE_URL}${canonical}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || "",
      creator: SOCIAL_HANDLE,
      site: SOCIAL_HANDLE,
    },
    alternates: {
      canonical,
    },
  };
};

export const generateStaticParams = async () => {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
};

async function Article({ slug, content }: { slug: string; content: string }) {
  "use cache";
  cacheLife("max");
  cacheTag(`posts:slug:${slug}`);

  return (
    <article className="prose dark:prose-invert max-w-none">
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            format: "md",
            remarkPlugins: [
              remarkGfm,
              [
                remarkToc,
                {
                  heading: "Table of Contents|Contents|TOC",
                  maxDepth: 3,
                  tight: true,
                },
              ],
            ],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "append",
                  properties: {
                    className: ["permalink"],
                  },
                },
              ],
            ],
          },
        }}
      />
    </article>
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = post.publishedAt || post.createdAt;
  const [initialViewCount, previousPost, nextPost] = await Promise.all([
    getPostViewCount(post.id),
    getPreviousPost(publishedDate),
    getNextPost(publishedDate),
  ]);

  const structuredData: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: publishedDate.toISOString(),
    dateModified: post.modifiedAt.toISOString(),
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    wordCount: post.content.split(/\s+/).length,
    inLanguage: "en-SG",
    author: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
    image: {
      "@type": "ImageObject",
      url: `${SITE_URL}/blog/${post.slug}/opengraph-image`,
    },
    keywords: post.tags?.join(", "),
    articleSection:
      post.dataType === "cars" ? "Market Analysis" : "COE Bidding",
    isPartOf: {
      "@type": "Blog",
      name: `${SITE_TITLE} Blog`,
      url: `${SITE_URL}/blog`,
    },
  };

  const readingTimeText = readingTime(post.content).text;

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        }}
      />
      <ProgressBar />

      {/* Full-width content wrapper */}
      <div className="flex flex-col">
        {/* Bloomberg-style Hero with overlaid title */}
        <BlogHero
          title={post.title}
          slug={post.slug}
          publishedAt={publishedDate}
          readingTimeText={readingTimeText}
          tags={post.tags}
          postId={post.id}
          initialViewCount={initialViewCount}
          heroImage={post.heroImage}
        />

        {/* Main Content - Single column, centered */}
        <div className="container mx-auto flex flex-col gap-8">
          <div className="flex justify-end">
            <ShareButtons url={`/blog/${post.slug}`} title={post.title} />
          </div>

          {/* Table of Contents */}
          <TableOfContents />

          {/* Excerpt / Executive Summary */}
          {post.excerpt && (
            <section>
              <h2 className="mb-4 font-bold text-foreground/60 text-xs uppercase tracking-[0.3em]">
                Executive Summary
              </h2>
              <Card className="border-accent border-l-4 bg-transparent shadow-none">
                <Card.Content className="py-0 pl-4">
                  <p className="text-foreground/90 text-lg leading-relaxed md:text-xl">
                    {post.excerpt}
                  </p>
                </Card.Content>
              </Card>
            </section>
          )}

          {/* Key Highlights */}
          <KeyHighlights
            highlights={post.highlights as Highlight[] | undefined}
          />

          {/* Article Content */}
          <Article slug={post.slug} content={post.content} />

          {/* Post Navigation */}
          <PostNavigation previous={previousPost} next={nextPost} />

          {/* Related Posts */}
          <RelatedPosts currentPostId={post.id} />

          <Separator className="my-6" />
          <div className="flex justify-center pb-8">
            <Link href="/blog" className="no-underline">
              <Button variant="ghost">
                <Undo2 className="size-4" />
                Back to blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
