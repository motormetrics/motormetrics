import { Card, Skeleton } from "@heroui/react";
import { BlogListSection } from "@web/app/(main)/(site)/blog/components/blog-list-section";
import { BlogSearchInput } from "@web/app/(main)/(site)/blog/components/blog-search-input";
import { FeaturedSection } from "@web/app/(main)/(site)/blog/components/featured-section";
import { loadSearchParams } from "@web/app/(main)/(site)/blog/search-params";
import { PageHead } from "@web/components/shared/page-head";
import { SitePage } from "@web/components/shared/site-page";
import { StructuredData } from "@web/components/structured-data";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getAllPosts } from "@web/queries/posts";
import { formatDate } from "@web/utils/dates/format-date";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { Blog, WithContext } from "schema-dts";

const title = "Insights and Market Analysis";
const description =
  "Data-driven insights and analysis on Singapore's car market, COE trends, and registration statistics. Expert commentary on the latest automotive data.";
const url = "/blog";

const structuredData: WithContext<Blog> = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: title,
  url,
  description,
};

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: url,
  },
};

interface BlogPageProps {
  searchParams: Promise<SearchParams>;
}

/**
 * Everything below the search box depends on `?q`, so it all sits under one
 * boundary: a search replaces the featured panel with the results rather than
 * listing them beneath a post that may not match.
 */
async function BlogBody({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q: query } = await loadSearchParams(searchParams);

  return (
    <>
      {query ? null : <FeaturedSection />}
      <BlogListSection query={query} />
    </>
  );
}

/** The head's date line: when the newest post went out. */
async function LatestPostLine() {
  const [latest] = await getAllPosts();

  return (
    <>
      {latest ? (
        <>
          Latest post{" "}
          <span className="font-semibold text-foreground">
            {formatDate(latest.publishedAt ?? latest.createdAt)}
          </span>{" "}
          ·{" "}
        </>
      ) : null}
      Source: LTA via DataMall
    </>
  );
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <>
      <StructuredData data={structuredData} />
      <SitePage className="gap-10 max-md:gap-7">
        <PageHead
          contentType="blog"
          controls={
            <Suspense>
              <BlogSearchInput />
            </Suspense>
          }
          description="Short reads on registrations, COE bidding and the electric shift. Published after each release, never before."
          eyebrow="Market commentary"
          sub={
            <Suspense fallback={<Skeleton className="h-5 w-64 rounded-md" />}>
              <LatestPostLine />
            </Suspense>
          }
          title="What the numbers did this month"
        />
        <Suspense
          fallback={
            <>
              <Card className="min-h-72">
                <Card.Header className="items-start gap-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-full" />
                </Card.Header>
                <Card.Content className="gap-4">
                  <Skeleton className="h-24 w-full" />
                </Card.Content>
              </Card>
              <div className="flex flex-col gap-4">
                {Array.from({ length: 6 }, (_, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are static placeholders
                  <Skeleton key={index} className="h-20 w-full" />
                ))}
              </div>
            </>
          }
        >
          <BlogBody searchParams={searchParams} />
        </Suspense>
      </SitePage>
    </>
  );
}
