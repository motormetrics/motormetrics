import { BlogHead } from "@web/app/(main)/(site)/blog/components/blog-head";
import { BlogListSection } from "@web/app/(main)/(site)/blog/components/blog-list-section";
import { BlogSearchInput } from "@web/app/(main)/(site)/blog/components/blog-search-input";
import { FeaturedSection } from "@web/app/(main)/(site)/blog/components/featured-section";
import { loadSearchParams } from "@web/app/(main)/(site)/blog/search-params";
import { SitePage } from "@web/components/shared/site-page";
import { StructuredData } from "@web/components/structured-data";
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
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
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

export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <>
      <StructuredData data={structuredData} />
      <SitePage>
        <BlogHead
          description="Short reads on registrations, COE bidding and the electric shift. Published after each release, never before."
          title="What the numbers did this month."
        />
        <Suspense>
          <BlogSearchInput />
        </Suspense>
        <Suspense>
          <BlogBody searchParams={searchParams} />
        </Suspense>
      </SitePage>
    </>
  );
}
