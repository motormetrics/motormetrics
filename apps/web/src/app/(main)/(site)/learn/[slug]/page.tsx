import { Button, Card, Chip, Link, Separator } from "@heroui/react";
import { StructuredData } from "@web/components/structured-data";
import Typography from "@web/components/typography";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { Article, DefinedTerm, WithContext } from "schema-dts";
import { GUIDES, getAllGuideSlugs, getGuideBySlug } from "../lib/guides";

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
    <article className="prose dark:prose-invert max-w-none">
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

  // Find previous and next guides for navigation
  const currentIndex = GUIDES.findIndex((g) => g.slug === slug);
  const previousGuide = currentIndex > 0 ? GUIDES[currentIndex - 1] : null;
  const nextGuide =
    currentIndex < GUIDES.length - 1 ? GUIDES[currentIndex + 1] : null;

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

      <div className="container mx-auto flex flex-col gap-8 px-4 py-8">
        {/* Back to Learn link */}
        <Link
          href="/learn"
          className="flex w-fit items-center gap-2 text-foreground text-sm"
        >
          <ArrowLeft className="size-4" />
          Back to Learn
        </Link>

        {/* Header */}
        <header className="flex flex-col gap-4">
          <Chip variant="soft" color="accent" size="sm">
            <BookOpen className="size-3" />
            {guide.term}
          </Chip>
          <Typography.H1>{guide.title}</Typography.H1>
          <Typography.TextLg className="text-muted">
            {guide.excerpt}
          </Typography.TextLg>
          <Typography.Caption>
            Last updated:{" "}
            {new Date(guide.lastUpdated).toLocaleDateString("en-SG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Typography.Caption>
        </header>

        <Separator />

        {/* Main Content */}
        <GuideContent slug={guide.slug} content={guide.content} />

        {/* Related Links */}
        {guide.relatedLinks.length > 0 && (
          <Card className="shadow-sm">
            <Card.Header>
              <Typography.H4>Explore Data</Typography.H4>
            </Card.Header>
            <Card.Content className="flex flex-row flex-wrap gap-2">
              {guide.relatedLinks.map((link) => (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className="no-underline"
                >
                  <Button variant="primary" size="sm">
                    {link.label}
                  </Button>
                </NextLink>
              ))}
            </Card.Content>
          </Card>
        )}

        <Separator />

        {/* Guide Navigation */}
        <nav className="flex justify-between gap-4">
          {previousGuide ? (
            <NextLink
              href={`/learn/${previousGuide.slug}`}
              className="flex-1 no-underline"
            >
              <Button variant="outline" className="w-full justify-start">
                <ArrowLeft className="size-4" />
                <span className="flex flex-col items-start">
                  <span className="text-muted text-xs">Previous</span>
                  <span>{previousGuide.term}</span>
                </span>
              </Button>
            </NextLink>
          ) : (
            <div className="flex-1" />
          )}
          {nextGuide ? (
            <NextLink
              href={`/learn/${nextGuide.slug}`}
              className="flex-1 no-underline"
            >
              <Button variant="outline" className="w-full justify-end">
                <span className="flex flex-col items-end">
                  <span className="text-muted text-xs">Next</span>
                  <span>{nextGuide.term}</span>
                </span>
                <ArrowRight className="size-4" />
              </Button>
            </NextLink>
          ) : (
            <div className="flex-1" />
          )}
        </nav>

        {/* Back to Learn */}
        <div className="flex justify-center pb-8">
          <NextLink href="/learn" className="no-underline">
            <Button variant="ghost">
              <BookOpen className="size-4" />
              Back to Learn Hub
            </Button>
          </NextLink>
        </div>
      </div>
    </>
  );
}
