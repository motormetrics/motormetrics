import { Skeleton, Typography } from "@heroui/react";
import { BlogArchive } from "@web/app/(main)/(site)/blog/components/blog-list-section";
import { BlogSearchInput } from "@web/app/(main)/(site)/blog/components/blog-search-input";
import { FeaturedPost } from "@web/app/(main)/(site)/blog/components/featured-post";
import type { Highlight } from "@web/app/(main)/(site)/blog/components/key-highlights";
import { MostRead } from "@web/app/(main)/(site)/blog/components/popular-posts";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { HeadGrid, HeadTitle } from "@web/components/shared/head-grid";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getAllPosts } from "@web/queries/posts";
import { formatDate } from "@web/utils/dates/format-date";
import type { Metadata } from "next";
import Link from "next/link";
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

/** The head's source line: when the newest post went out. Cached posts only. */
async function LatestPostLine() {
  const [latest] = await getAllPosts();

  return (
    <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
      {latest ? (
        <>
          Latest post{" "}
          <span className="font-semibold text-foreground">
            {formatDate(latest.publishedAt ?? latest.createdAt)}
          </span>{" "}
          ·{" "}
        </>
      ) : null}
      Source: LTA via DataMall.
    </Typography.Paragraph>
  );
}

/**
 * The lead post, and its source line when it quotes figures. Cached posts
 * only, so it needs no Suspense boundary.
 */
async function LatestPost() {
  const [latest] = await getAllPosts();

  if (!latest) {
    return null;
  }

  const hasFigures =
    Array.isArray(latest.highlights) &&
    (latest.highlights as Highlight[]).length > 0;

  return (
    <section className="flex flex-col gap-6">
      <FeaturedPost post={latest} />
      {hasFigures ? (
        <SourceNote>
          Figures quoted in the latest post. Source: LTA via DataMall.
        </SourceNote>
      ) : null}
    </section>
  );
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
        {/* Direction D's head, with the most-read list beside it once the
            page is wide and under it before then. Both read cached posts
            only, so they are part of the static shell. */}
        <HeadGrid
          keys={
            <SectionErrorBoundary title="Most read unavailable">
              <MostRead />
            </SectionErrorBoundary>
          }
        >
          <HeadTitle
            eyebrow="Market commentary"
            title="What the numbers did this month"
          />
          <Typography.Paragraph className="max-w-prose">
            Short reads on registrations, COE bidding and the electric shift.
            Published after each release, never before.
          </Typography.Paragraph>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <LatestPostLine />
            <div className="sm:ml-auto">
              <SharePill contentType="blog" title={title} />
            </div>
          </div>
          <Typography.Paragraph color="muted" size="sm">
            Looking for explainers on COE, PQP or PARF?{" "}
            <Link
              className="font-semibold text-accent no-underline transition-colors hover:text-accent"
              href="/learn"
            >
              See Guides
            </Link>
          </Typography.Paragraph>
        </HeadGrid>

        <Hairline />

        <SectionErrorBoundary title="Latest post unavailable">
          <LatestPost />
        </SectionErrorBoundary>

        <Hairline />

        <section className="flex flex-col gap-4">
          <SectionHead
            eyebrow="Archive"
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
          <SourceNote>
            Posts on motormetrics.app/blog, newest first. Source: LTA via
            DataMall.
          </SourceNote>
        </section>
      </OverviewPage>
    </>
  );
}
