import { Skeleton } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
import { AllMakesCard } from "@web/app/(main)/(dashboard)/cars/makes/components/all-makes-card";
import { ConcentrationCard } from "@web/app/(main)/(dashboard)/cars/makes/components/concentration-card";
import { ElectricOnlyMakes } from "@web/app/(main)/(dashboard)/cars/makes/components/electric-only-makes";
import { FastestGrowing } from "@web/app/(main)/(dashboard)/cars/makes/components/fastest-growing";
import { LeadingMakeCard } from "@web/app/(main)/(dashboard)/cars/makes/components/leading-make-card";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import {
  Hairline,
  OverviewGrid,
  SectionHead,
} from "@web/components/shared/overview";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import { generateItemListSchema } from "@web/lib/metadata";
import { getDistinctMakes } from "@web/queries/cars/filter-options";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

async function MakesItemList() {
  const makes = await getDistinctMakes();

  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        ...generateItemListSchema(
          "Car Makes in Singapore",
          makes.map(({ make }) => ({
            name: make,
            url: `${SITE_URL}/cars/makes/${slugify(make)}`,
          })),
        ),
      }}
    />
  );
}

/**
 * Every make as a plain link. The table above shows its top ten until the
 * reader expands it, and that expansion happens in the browser, so without
 * this list most make pages have nothing linking to them in the HTML.
 */
async function MakesDirectory() {
  const makes = await getDistinctMakes();

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={`${makes.length} makes`}
        eyebrow="Directory"
        title="Every make, A to Z"
      />
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {makes.map(({ make }) => (
          <li key={make}>
            <Link
              className="font-medium text-muted text-sm transition-colors hover:text-accent"
              href={`/cars/makes/${slugify(make)}`}
            >
              {make}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MakesContentSection({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <MakesItemList />
      </Suspense>

      {/* Who leads, and how tightly the market is held */}
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
        <SectionErrorBoundary title="Leading make unavailable">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <LeadingMakeCard searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Market concentration unavailable">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <ConcentrationCard searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
      </div>

      <Hairline />

      <SectionErrorBoundary title="Makes table unavailable">
        <Suspense fallback={<Skeleton className="h-[720px] w-full" />}>
          <AllMakesCard searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <OverviewGrid>
        <SectionErrorBoundary title="Movers unavailable">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <FastestGrowing searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Electric-only makes unavailable">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ElectricOnlyMakes />
          </Suspense>
        </SectionErrorBoundary>
      </OverviewGrid>

      <Hairline />

      <SectionErrorBoundary title="Makes directory unavailable">
        <Suspense fallback={null}>
          <MakesDirectory />
        </Suspense>
      </SectionErrorBoundary>
    </>
  );
}
