import { Skeleton } from "@heroui/react";
import { slugify } from "@motormetrics/utils";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Hairline, OverviewGrid } from "@web/components/shared/overview";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateItemListSchema } from "@web/lib/metadata";
import { getGroupedMakes } from "@web/queries/cars";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";
import { AllMakesCard } from "./all-makes-card";
import { ConcentrationCard } from "./concentration-card";
import { ElectricOnlyMakes } from "./electric-only-makes";
import { FastestGrowing } from "./fastest-growing";
import { LeadingMakeCard } from "./leading-make-card";

const description =
  "Comprehensive overview of car makes in Singapore. Explore popular brands, discover all available manufacturers, and view registration trends and market statistics.";

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Makes",
  description,
  url: `${SITE_URL}/cars/makes`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

async function MakesItemList() {
  const { sortedMakes } = await getGroupedMakes();

  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        ...generateItemListSchema(
          "Car Makes in Singapore",
          sortedMakes.map((make) => ({
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
      <StructuredData data={structuredData} />
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
