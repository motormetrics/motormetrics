import { KeyInsights } from "@web/app/(main)/(dashboard)/coe/premiums/components/key-insights";
import { BonesFallback } from "@web/components/shared/bones-fallback";
import { BonesCapture } from "@web/components/shared/bones-skeleton";
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

  return (
    <BonesCapture name="key-insights">
      <KeyInsights insights={keyInsights} />
    </BonesCapture>
  );
}

export function KeyInsightsSection() {
  return (
    <Suspense fallback={<BonesFallback name="key-insights" />}>
      <KeyInsightsContent />
    </Suspense>
  );
}
