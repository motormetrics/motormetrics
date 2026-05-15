import { KeyInsights } from "@web/app/[locale]/(main)/(dashboard)/coe/premiums/components/key-insights";
import { SkeletonCard } from "@web/components/shared/skeleton";
import {
  calculateBiggestMovers,
  calculateNearRecords,
  calculatePremiumRangeStats,
  generateKeyInsights,
} from "@web/lib/coe/calculations";
import {
  getCoeResults,
  getLatestAndPreviousCoeResults,
} from "@web/queries/coe";
import { Suspense } from "react";

const ALL_CATEGORIES = [
  "Category A",
  "Category B",
  "Category C",
  "Category D",
  "Category E",
];

async function KeyInsightsContent() {
  const [{ latest: latestResults, previous: previousResults }, allCoeResults] =
    await Promise.all([getLatestAndPreviousCoeResults(), getCoeResults()]);

  const premiumRangeStats = calculatePremiumRangeStats(
    allCoeResults,
    ALL_CATEGORIES,
  );
  const movers = calculateBiggestMovers(latestResults, previousResults);
  const nearRecords = calculateNearRecords(latestResults, premiumRangeStats);
  const keyInsights = generateKeyInsights(movers, nearRecords);

  if (keyInsights.length === 0) {
    return null;
  }

  return <KeyInsights insights={keyInsights} />;
}

function KeyInsightsSkeleton() {
  return <SkeletonCard className="h-16 w-full" />;
}

export function KeyInsightsSection() {
  return (
    <Suspense fallback={<KeyInsightsSkeleton />}>
      <KeyInsightsContent />
    </Suspense>
  );
}
