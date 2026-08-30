import { GuideHead } from "@web/app/(main)/(site)/learn/[slug]/components/guide-head";
import { GuideSidebar } from "@web/app/(main)/(site)/learn/[slug]/components/guide-sidebar";
import { RelatedGuides } from "@web/app/(main)/(site)/learn/[slug]/components/related-guides";
import {
  getAllGuideSlugs,
  getGuideBySlug,
} from "@web/app/(main)/(site)/learn/lib/guides";
import { SitePage } from "@web/components/shared/site-page";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { Article, DefinedTerm, WithContext } from "schema-dts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return { title: "Guide Not Found" };
  }

  const canonical = `/learn/${guide.slug}`;

  return {
    title: guide.title,
    description: guide.description,
    authors: [{ name: SITE_TITLE, url: SITE_URL }],
    creator: SITE_TITLE,
    publisher: SITE_TITLE,
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      publishedTime: guide.lastUpdated,
      modifiedTime: guide.lastUpdated,
      authors: [SITE_TITLE],
      url: `${SITE_URL}${canonical}`,
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      creator: SOCIAL_HANDLE,
      site: SOCIAL_HANDLE,
    },
    alternates: {
      canonical,
    },
  };
}

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

/**
 * The article body, held at the comp's 700px reading measure.
 *
 * `prose` carries the markdown; the modifiers pull its greys onto the site's
 * own tokens so the copy matches the type around it.
 */
async function GuideContent({
  slug,
  content,
}: {
  slug: string;
  content: string;
}) {
  "use cache";
  cacheLife("max");
  cacheTag(`learn:${slug}`);

  return (
    <article className="prose dark:prose-invert max-w-[43.75rem] prose-headings:font-bold prose-a:text-accent-strong prose-headings:text-foreground prose-li:text-muted prose-p:text-muted prose-strong:text-foreground prose-td:text-muted prose-th:text-foreground prose-p:leading-[1.7] prose-headings:tracking-[-0.02em]">
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            format: "md",
            remarkPlugins: [remarkGfm],
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

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const articleSchema: WithContext<Article> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.lastUpdated,
    dateModified: guide.lastUpdated,
    url: `${SITE_URL}/learn/${guide.slug}`,
    mainEntityOfPage: `${SITE_URL}/learn/${guide.slug}`,
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
    articleSection: "Educational Guide",
    isPartOf: {
      "@type": "WebPage",
      name: "Learn",
      url: `${SITE_URL}/learn`,
    },
  };

  const definedTermSchema: WithContext<DefinedTerm> = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: guide.term,
    description: guide.excerpt,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Singapore Automotive Terms",
      url: `${SITE_URL}/learn`,
    },
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Learn", path: "/learn" },
    { name: guide.term, path: `/learn/${guide.slug}` },
  ]);

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={definedTermSchema} />
      <StructuredData
        data={{ "@context": "https://schema.org", ...breadcrumbSchema }}
      />

      <SitePage className="gap-14">
        <GuideHead guide={guide} />

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <GuideContent content={guide.content} slug={guide.slug} />
          <GuideSidebar guide={guide} />
        </div>

        <RelatedGuides guide={guide} />
      </SitePage>
    </>
  );
}
