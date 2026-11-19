import { Skeleton, Typography } from "@heroui/react";
import { BlogArchive } from "@web/app/(main)/(site)/blog/components/blog-list-section";
import { BlogSearchInput } from "@web/app/(main)/(site)/blog/components/blog-search-input";
import { HeadTitle } from "@web/components/shared/head-grid";
import {
  Hairline,
  OverviewPage,
  SectionHead,
} from "@web/components/shared/overview";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
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

/** Stands in for the archive while `?q` is read: tabs and two rows of cards. */
function ArchiveSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-full max-w-xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are static placeholders
          <Skeleton className="h-48 w-full" key={index} />
        ))}
      </div>
    </div>
  );
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <>
      <StructuredData data={structuredData} />
      <OverviewPage className="gap-8 max-md:gap-6">
        <div className="flex flex-col gap-4">
          <HeadTitle
            eyebrow="Market commentary"
            title="What the numbers did this month"
          />
          <Typography.Paragraph className="max-w-prose">
            Short reads on registrations, COE bidding and the electric shift.
          </Typography.Paragraph>
          <div>
            <SharePill contentType="blog" title={title} />
          </div>
        </div>

        <Hairline />

        <section className="flex flex-col gap-4">
          <SectionHead
            title="All posts"
            trailing={
              <Suspense fallback={<Skeleton className="h-9 w-72 max-w-full" />}>
                <BlogSearchInput />
              </Suspense>
            }
          />
          <Suspense fallback={<ArchiveSkeleton />}>
            <BlogArchive searchParams={searchParams} />
          </Suspense>
        </section>
      </OverviewPage>
    </>
  );
}
