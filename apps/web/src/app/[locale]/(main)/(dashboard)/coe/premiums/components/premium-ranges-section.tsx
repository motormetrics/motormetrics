import { PremiumRangeCard } from "@web/app/[locale]/(main)/(dashboard)/coe/premiums/components/premium-range-card";
import { GridSkeleton, SectionSkeleton } from "@web/components/shared/skeleton";
import Typography from "@web/components/typography";
import { calculatePremiumRangeStats } from "@web/lib/coe/calculations";
import { getCoeResults } from "@web/queries/coe";
import { Suspense } from "react";

const ALL_CATEGORIES = [
  "Category A",
  "Category B",
  "Category C",
  "Category D",
  "Category E",
];

async function PremiumRangesContent() {
  const allCoeResults = await getCoeResults();
  const premiumRangeStats = calculatePremiumRangeStats(
    allCoeResults,
    ALL_CATEGORIES,
  );

  return (
    <div className="flex flex-col gap-4">
      <Typography.H2>Premium Ranges</Typography.H2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <PremiumRangeCard stats={premiumRangeStats} />
      </div>
    </div>
  );
}

function PremiumRangesSkeleton() {
  return (
    <SectionSkeleton>
      <GridSkeleton
        count={5}
        columns="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
      />
    </SectionSkeleton>
  );
}

export function PremiumRangesSection() {
  return (
    <Suspense fallback={<PremiumRangesSkeleton />}>
      <PremiumRangesContent />
    </Suspense>
  );
}
