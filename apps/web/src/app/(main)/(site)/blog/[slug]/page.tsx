import { Typography } from "@heroui/react";
import {
  type Highlight,
  KeyHighlights,
} from "@web/app/(main)/(site)/blog/components/key-highlights";
import { mdxComponents } from "@web/app/(main)/(site)/blog/components/mdx-components";
import { getArticleSection } from "@web/app/(main)/(site)/blog/components/post/utils";
import { PostHead } from "@web/app/(main)/(site)/blog/components/post-head";
import { PostNavigation } from "@web/app/(main)/(site)/blog/components/post-navigation";
import { PostSidebar } from "@web/app/(main)/(site)/blog/components/post-sidebar";
import { ProgressBar } from "@web/app/(main)/(site)/blog/components/progress-bar";
import { RelatedPosts } from "@web/app/(main)/(site)/blog/components/related-posts";
import { SitePage } from "@web/components/shared/site-page";
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
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import readingTime from "reading-time";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import type { BlogPosting, WithContext } from "schema-dts";

/** Enough of the excerpt to identify it, short of where rewording sets in. */
const LEDE_PREFIX_LENGTH = 80;

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

/**
 * The article body, filling the full column beside the rail at the comp's
 * 18px body size — no second cap, so nothing leaves a gutter before the rail.
 *
 * `prose` carries the markdown; the modifiers pull its greys onto the site's
 * own tokens so the copy matches the type around it.
 */
async function Article({ slug, content }: { slug: string; content: string }) {
  "use cache";
  cacheLife("max");
  cacheTag(`posts:slug:${slug}`);

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-accent-strong prose-headings:text-foreground prose-li:text-muted prose-p:text-muted prose-strong:text-foreground prose-td:text-muted prose-th:text-foreground prose-p:leading-relaxed prose-headings:tracking-tight">
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
    </div>
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = post.publishedAt || post.createdAt;

  // Generated posts often open the body with the excerpt, sometimes reworded
  // a few words in. The lede repeats it only when the body does not open with
  // its first sentence or so, so the same paragraph never renders twice.
  const normalise = (text: string) => text.replace(/\s+/g, " ").trim();
  const lede =
    post.excerpt &&
    !normalise(post.content).startsWith(
      normalise(post.excerpt).slice(0, LEDE_PREFIX_LENGTH),
    )
      ? post.excerpt
      : null;

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
    articleSection: getArticleSection(post),
    isPartOf: {
      "@type": "Blog",
      name: `${SITE_TITLE} Blog`,
      url: `${SITE_URL}/blog`,
    },
  };

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

      <SitePage className="gap-14">
        <PostHead
          initialViewCount={initialViewCount}
          post={post}
          publishedAt={publishedDate}
          readingTimeText={readingTime(post.content).text}
        />

        {post.heroImage ? (
          <div className="relative aspect-12/5 w-full overflow-hidden rounded-4xl bg-surface-secondary shadow-surface">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1180px) 100vw, 1180px"
              src={post.heroImage}
            />
          </div>
        ) : null}

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <article className="flex min-w-0 flex-col gap-7">
            {lede ? (
              <Typography.Paragraph className="font-medium text-2xl text-foreground leading-normal">
                {lede}
              </Typography.Paragraph>
            ) : null}

            <KeyHighlights
              highlights={post.highlights as Highlight[] | undefined}
            />

            <Article slug={post.slug} content={post.content} />

            <PostNavigation previous={previousPost} next={nextPost} />
          </article>

          <PostSidebar post={post} />
        </div>

        <RelatedPosts currentPostId={post.id} />
      </SitePage>
    </>
  );
}
