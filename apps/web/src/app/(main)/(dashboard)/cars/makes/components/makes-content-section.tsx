import { Skeleton } from "@heroui/react";
import { slugify } from "@motormetrics/utils";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { StructuredData } from "@web/components/structured-data";
import { Bento, BentoColumn, Rail } from "@web/components/v2/bento";
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

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-card)] bg-surface p-8 shadow-surface ${className ?? ""}`}
    >
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-12 w-40 rounded-lg" />
        <Skeleton className="h-6 w-44 rounded-full" />
      </div>
    </div>
  );
}

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

      <Bento>
        {/* Left column — who leads, and how tightly the market is held */}
        <BentoColumn>
          <SectionErrorBoundary title="Leading make unavailable">
            <Suspense fallback={<CardSkeleton className="h-[520px]" />}>
              <LeadingMakeCard searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Market concentration unavailable">
            <Suspense fallback={<CardSkeleton className="h-[420px]" />}>
              <ConcentrationCard searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </BentoColumn>

        {/* Middle column — the full table */}
        <BentoColumn>
          <SectionErrorBoundary title="Makes table unavailable">
            <Suspense fallback={<CardSkeleton className="h-[900px]" />}>
              <AllMakesCard searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </BentoColumn>

        {/* Right rail — warm sand well: movers over a dark electric panel */}
        <Rail>
          <SectionErrorBoundary title="Movers unavailable">
            <Suspense fallback={<CardSkeleton className="h-96" />}>
              <FastestGrowing searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Electric-only makes unavailable">
            <Suspense fallback={<CardSkeleton className="h-80" />}>
              <ElectricOnlyMakes />
            </Suspense>
          </SectionErrorBoundary>
        </Rail>
      </Bento>
    </>
  );
}
