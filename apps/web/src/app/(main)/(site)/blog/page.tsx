import { BlogListSection } from "@web/app/(main)/(site)/blog/components/blog-list-section";
import { BlogPageHeader } from "@web/app/(main)/(site)/blog/components/blog-page-header";
import { BlogSearchInput } from "@web/app/(main)/(site)/blog/components/blog-search-input";
import { PopularPostsSection } from "@web/app/(main)/(site)/blog/components/popular-posts-section";
import { loadSearchParams } from "@web/app/(main)/(site)/blog/search-params";
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

async function BlogListWithSearch({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q: query } = await loadSearchParams(searchParams);

  return <BlogListSection query={query} />;
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <>
      <StructuredData data={structuredData} />
      <section className="flex flex-col gap-8">
        <BlogPageHeader title={title} description={description} />
        <Suspense>
          <BlogSearchInput />
        </Suspense>
        <PopularPostsSection />
        <Suspense>
          <BlogListWithSearch searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
