import { Skeleton } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
import { AllMakesCard } from "@web/app/(main)/(dashboard)/cars/makes/components/all-makes-card";
import { ConcentrationCard } from "@web/app/(main)/(dashboard)/cars/makes/components/concentration-card";
import { ElectricOnlyMakes } from "@web/app/(main)/(dashboard)/cars/makes/components/electric-only-makes";
import { FastestGrowing } from "@web/app/(main)/(dashboard)/cars/makes/components/fastest-growing";
import { LeadingMakeCard } from "@web/app/(main)/(dashboard)/cars/makes/components/leading-make-card";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Hairline, OverviewGrid } from "@web/components/shared/overview";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import { generateItemListSchema } from "@web/lib/metadata";
import { getDistinctMakes } from "@web/queries/cars/filter-options";
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
      <OverviewGrid>
        <SectionErrorBoundary title="Leading make unavailable">
          <Suspense fallback={<Skeleton className="h-80 w-full rounded-lg" />}>
            <LeadingMakeCard searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Market concentration unavailable">
          <Suspense fallback={<Skeleton className="h-80 w-full rounded-lg" />}>
            <ConcentrationCard searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
      </OverviewGrid>

      <Hairline />

      <SectionErrorBoundary title="Makes table unavailable">
        <Suspense
          fallback={<Skeleton className="h-[720px] w-full rounded-lg" />}
        >
          <AllMakesCard searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <OverviewGrid>
        <SectionErrorBoundary title="Movers unavailable">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
            <FastestGrowing searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Electric-only makes unavailable">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
            <ElectricOnlyMakes />
          </Suspense>
        </SectionErrorBoundary>
      </OverviewGrid>
    </>
  );
}
