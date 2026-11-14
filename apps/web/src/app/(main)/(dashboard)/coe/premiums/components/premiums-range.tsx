import { Skeleton } from "@heroui/react";
import { premiumRangeStats } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { PremiumRangeBar } from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-range-bar";
import { rangeCaption } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-shared";
import {
  loadPremiumsView,
  type PremiumsPageProps,
  SelectedCategory,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-view";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { Suspense } from "react";

/** The year-to-date and all-time ranges for the selected category. */
async function loadRanges(searchParams: PremiumsPageProps["searchParams"]) {
  const view = await loadPremiumsView(searchParams);
  if (!view) {
    return null;
  }

  const { allExercises, category, history, year } = view;
  const allPremiums = allExercises.map(({ premium }) => premium);
  return {
    allTimeHigh: allPremiums.length ? Math.max(...allPremiums) : 0,
    allTimeRange: premiumRangeStats(allExercises),
    category,
    year,
    yearRange: premiumRangeStats(
      history.filter(({ month }) => month.startsWith(`${year}-`)),
    ),
  };
}

/** Figure 4: the year-to-date and all-time premium ranges on one $0 scale. */
export function PremiumsRange({ searchParams }: PremiumsPageProps) {
  return (
    <section className="flex scroll-mt-4 flex-col gap-4" id="prem-rng">
      <SectionHead
        caption={
          <Suspense fallback=" ">
            <RangeCaption searchParams={searchParams} />
          </Suspense>
        }
        eyebrow="Figure 4 · Range"
        title={
          <>
            <SelectedCategory searchParams={searchParams} /> premium range
          </>
        }
      />
      <SectionErrorBoundary title="Premium range unavailable">
        <Suspense fallback={<Skeleton className="h-40 w-full rounded-md" />}>
          <RangeBars searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
      <SourceNote>
        Lowest to highest closing premium on a shared scale from $0. All-time
        covers every exercise on record. No exercises were held from April to
        June 2020.
      </SourceNote>
    </section>
  );
}

async function RangeCaption({ searchParams }: PremiumsPageProps) {
  const ranges = await loadRanges(searchParams);
  return ranges
    ? (rangeCaption(
        ranges.category,
        ranges.year,
        ranges.yearRange,
        ranges.allTimeRange,
      ) ?? null)
    : null;
}

async function RangeBars({ searchParams }: PremiumsPageProps) {
  const ranges = await loadRanges(searchParams);
  if (!ranges) {
    return null;
  }

  const { allTimeHigh, allTimeRange, year, yearRange } = ranges;
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      {yearRange ? (
        <PremiumRangeBar
          high={yearRange.high}
          label={`${year} year to date`}
          low={yearRange.low}
          scale={allTimeHigh}
        />
      ) : null}
      {allTimeRange ? (
        <PremiumRangeBar
          high={allTimeRange.high}
          label="All-time"
          low={allTimeRange.low}
          scale={allTimeHigh}
        />
      ) : null}
    </div>
  );
}
