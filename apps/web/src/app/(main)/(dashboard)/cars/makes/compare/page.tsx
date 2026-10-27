import { Skeleton, Typography } from "@heroui/react";
import { ComparisonLinks } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/comparison-links";
import {
  COMPARE_PAIRS,
  findPair,
  pairSlug,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import {
  CompareHeadSkeleton,
  ComparisonBody,
  ComparisonHead,
  type ComparisonNames,
  loadComparison,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/components/comparison";
import {
  compareDescription,
  comparePath,
  compareSocialTitle,
  compareTitle,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/components/copy";
import { MakeSelectors } from "@web/app/(main)/(dashboard)/cars/makes/compare/components/make-selectors";
import {
  makeOptions,
  selectMakes,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/components/selection";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/compare/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { OverviewPage } from "@web/components/shared/overview";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import {
  createWebPageStructuredData,
  generateBreadcrumbSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getDistinctMakes } from "@web/queries/cars/filter-options";
import { getMakeFromSlug } from "@web/queries/cars/makes/get-make-from-slug";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const PATH = "/cars/makes/compare";
const title = "Compare Car Makes in Singapore";
const description =
  "Compare new car registrations of any two car makes in Singapore: year-to-date totals, change on last year, market share, fuel and body type mix, from LTA data.";

interface Selection {
  /** The valid make slugs, in column order; at most two. */
  slugs: string[];
  /** Both makes' DB names, once two valid makes are selected. */
  names?: ComparisonNames;
  /** The curated pair these two makes form in the other order, if any. */
  reversedPair?: ReturnType<typeof findPair>;
}

/**
 * The makes `?make=` selects. A curated pair in its canonical order redirects
 * to its own page. Called by the metadata and by every region rather than once
 * at the top of the page, so the page component never awaits `searchParams`
 * and the shell stays static; the reads are `'use cache'`.
 */
async function resolveSelection(
  searchParams: PageProps["searchParams"],
): Promise<Selection> {
  const [{ make }, rows] = await Promise.all([
    loadSearchParams(searchParams),
    getDistinctMakes(),
  ]);
  const slugs = selectMakes(
    make,
    makeOptions(rows).map(({ slug }) => slug),
  );
  const [first, second] = slugs;
  if (!first || !second) {
    return { slugs };
  }

  const curated = findPair(`${first}-vs-${second}`);
  if (curated) {
    redirect(comparePath(pairSlug(curated)));
  }

  // A lambda rather than passing `getMakeFromSlug` to `map`: the index and
  // array would become part of its `'use cache'` key.
  const [nameA, nameB] = await Promise.all(
    slugs.map((makeSlug) => getMakeFromSlug(makeSlug)),
  );
  if (!nameA || !nameB) {
    return { slugs };
  }

  return {
    slugs,
    names: { nameA, nameB },
    reversedPair: findPair(`${second}-vs-${first}`),
  };
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  // Metadata streams to most user agents, so a redirect thrown here may land
  // after the 200 is sent. `proxy.ts` answers canonical-order curated pairs
  // with a real 307 first; this is the fallback (e.g. an unknown slug ahead
  // of the pair).
  const { names, reversedPair } = await resolveSelection(searchParams);

  if (!names) {
    return {
      title,
      description,
      openGraph: {
        ...baseOpenGraph,
        title,
        description,
        url: `${SITE_URL}${PATH}`,
      },
      twitter: {
        ...baseTwitter,
        title,
        description,
      },
      alternates: {
        canonical: PATH,
      },
    };
  }

  const { nameA, nameB } = names;
  const pairDescription = compareDescription(nameA, nameB);
  const socialTitle = compareSocialTitle(nameA, nameB);
  // A curated pair in reverse consolidates into its curated page; any other
  // combination is a filter view, followed but not indexed.
  const canonical = reversedPair ? comparePath(pairSlug(reversedPair)) : PATH;

  return {
    title: compareTitle(nameA, nameB),
    description: pairDescription,
    ...(reversedPair ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      ...baseOpenGraph,
      title: socialTitle,
      description: pairDescription,
      url: `${SITE_URL}${canonical}`,
    },
    twitter: {
      ...baseTwitter,
      title: socialTitle,
      description: pairDescription,
    },
    alternates: {
      canonical,
    },
  };
}

export default function CompareCarMakesPage({ searchParams }: PageProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <Suspense fallback={null}>
        <SelectorStructuredData searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<CompareHeadSkeleton />}>
        <SelectorHead searchParams={searchParams} />
      </Suspense>

      <SectionErrorBoundary title="Comparison unavailable">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <SelectorContent searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </OverviewPage>
  );
}

/** WebPage and BreadcrumbList, only for the indexable empty state. */
async function SelectorStructuredData({ searchParams }: PageProps) {
  const { names } = await resolveSelection(searchParams);
  if (names) {
    return null;
  }

  return (
    <>
      <StructuredData
        data={createWebPageStructuredData(title, description, PATH)}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Makes", path: "/cars/makes" },
            { name: "Compare", path: PATH },
          ]),
        }}
      />
    </>
  );
}

/** The H1 and the two selectors, preselected with whatever is valid. */
async function SelectorHead({ searchParams }: PageProps) {
  const { names, slugs } = await resolveSelection(searchParams);
  const controls = <MakeSelectors selected={Promise.resolve(slugs)} />;

  if (!names) {
    return (
      <PageHead
        controls={controls}
        description="Choose two makes to compare their new car registrations side by side."
        eyebrow="Cars · Makes · Compare"
        title="Compare car makes in Singapore"
      />
    );
  }

  return <ComparisonHead controls={controls} names={Promise.resolve(names)} />;
}

/**
 * Popular comparisons until two makes are chosen, then the comparison itself —
 * unless either make has nothing registered this year.
 */
async function SelectorContent({ searchParams }: PageProps) {
  const { names } = await resolveSelection(searchParams);

  if (!names) {
    return (
      <ComparisonLinks
        eyebrow="Compare"
        pairs={COMPARE_PAIRS}
        title="Popular comparisons"
      />
    );
  }

  const comparisonNames = Promise.resolve(names);
  const { a, b, nameA, nameB } = await loadComparison(comparisonNames);
  const emptyMake = a.ytd === 0 ? nameA : b.ytd === 0 ? nameB : undefined;

  if (emptyMake) {
    return (
      <Typography.Paragraph className="max-w-prose">
        {`${emptyMake} has no new registrations so far this year, so there is nothing to compare.`}
      </Typography.Paragraph>
    );
  }

  return <ComparisonBody faqSchema={false} names={comparisonNames} />;
}
