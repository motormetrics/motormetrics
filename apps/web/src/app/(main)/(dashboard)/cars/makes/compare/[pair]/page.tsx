import { Skeleton } from "@heroui/react";
import {
  ComparisonLinks,
  pairNames,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/comparison-links";
import {
  COMPARE_PAIRS,
  findPair,
  otherPairs,
  pairSlug,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import {
  CompareHeadSkeleton,
  ComparisonBody,
  ComparisonHead,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/components/comparison";
import {
  compareDescription,
  comparePath,
  compareSocialTitle,
  compareTitle,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/components/copy";
import { MakeSelectors } from "@web/app/(main)/(dashboard)/cars/makes/compare/components/make-selectors";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import {
  createWebPageStructuredData,
  generateBreadcrumbSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ pair: string }>;
}

// No `dynamicParams = false`: the segment config is incompatible with
// `cacheComponents`. Any slug outside the curated pairs 404s in
// `resolvePair` instead.
export function generateStaticParams() {
  return COMPARE_PAIRS.map((pair) => ({ pair: pairSlug(pair) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { pair: slug } = await params;
  // 404 here, before any read: metadata blocks the response, so an uncurated
  // or reversed slug gets a real 404 status rather than a soft one from a
  // Suspense region after the shell has streamed.
  const pair = findPair(slug);
  if (!pair) {
    notFound();
  }

  const names = await pairNames(pair);
  if (!names) {
    notFound();
  }

  const [nameA, nameB] = names;
  const description = compareDescription(nameA, nameB);
  const socialTitle = compareSocialTitle(nameA, nameB);
  return {
    title: compareTitle(nameA, nameB),
    description,
    openGraph: {
      ...baseOpenGraph,
      title: socialTitle,
      description,
      url: `${SITE_URL}${comparePath(slug)}`,
    },
    twitter: {
      ...baseTwitter,
      title: socialTitle,
      description,
    },
    alternates: {
      canonical: comparePath(slug),
    },
  };
}

/**
 * Resolve the URL slug to a curated pair and both DB make names, 404ing on
 * anything else — the reversed order included. The curated check runs first,
 * so an unknown slug never reaches the database.
 *
 * Called per region rather than once at the top of the page, as the make page
 * does with `resolveMake`: awaiting `params` in the page component would take
 * the whole route out of the static shell. `getMakeFromSlug` is
 * `'use cache'`, so the repeats are reads, not lookups.
 */
async function resolvePair(params: PageProps["params"]) {
  const { pair: slug } = await params;
  const pair = findPair(slug);
  if (!pair) {
    notFound();
  }

  const names = await pairNames(pair);
  if (!names) {
    notFound();
  }

  const [nameA, nameB] = names;
  return { nameA, nameB, slug };
}

export default function CompareMakesPage({ params }: PageProps) {
  // Not awaited here: each region awaits it, so the shell stays static.
  const names = resolvePair(params);

  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <Suspense fallback={null}>
        <CompareStructuredData params={params} />
      </Suspense>

      <Suspense fallback={<CompareHeadSkeleton />}>
        <ComparisonHead
          controls={
            <MakeSelectors
              selected={params.then(({ pair }) => findPair(pair) ?? [])}
            />
          }
          names={names}
        />
      </Suspense>

      <ComparisonBody faqSchema names={names} />

      <Hairline />

      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <OtherComparisons params={params} />
      </Suspense>
    </OverviewPage>
  );
}

/** WebPage and BreadcrumbList for the pair. */
async function CompareStructuredData({ params }: PageProps) {
  const { nameA, nameB, slug } = await resolvePair(params);
  const path = comparePath(slug);

  return (
    <>
      <StructuredData
        data={createWebPageStructuredData(
          compareTitle(nameA, nameB),
          compareDescription(nameA, nameB),
          path,
        )}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Makes", path: "/cars/makes" },
            { name: `${nameA} vs ${nameB}`, path },
          ]),
        }}
      />
    </>
  );
}

/** Links to the other curated pairs and back to every make. */
async function OtherComparisons({ params }: PageProps) {
  const { slug } = await resolvePair(params);

  return (
    <ComparisonLinks
      eyebrow="Compare"
      link={{ href: "/cars/makes", label: "All makes" }}
      pairs={otherPairs(slug)}
      title="Other comparisons"
    />
  );
}
