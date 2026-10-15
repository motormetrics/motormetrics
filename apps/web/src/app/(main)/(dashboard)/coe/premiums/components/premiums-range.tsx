import {
  formatMonth,
  premiumRangeStats,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { PremiumRangeBar } from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-range-bar";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { CategoryExercise } from "@web/queries/coe";
import type { COECategory } from "@web/types";

/** The year-to-date and all-time premium ranges on a shared scale from $0. */
export function PremiumsRange({
  allExercises,
  category,
  history,
  year,
}: {
  /** Every exercise ever run for the category, oldest first. */
  allExercises: CategoryExercise[];
  category: COECategory;
  /** Every exercise up to and including the selected one, oldest first. */
  history: CategoryExercise[];
  year: number;
}) {
  const allPremiums = allExercises.map(({ premium }) => premium);
  const allTimeHigh = allPremiums.length ? Math.max(...allPremiums) : 0;
  const yearRange = premiumRangeStats(
    history.filter(({ month }) => month.startsWith(`${year}-`)),
  );
  const allTimeRange = premiumRangeStats(allExercises);

  return (
    <section className="flex min-w-0 flex-col gap-4 lg:col-span-7">
      <SectionHead
        caption="Lowest to highest closing premium · shared scale from $0"
        eyebrow="Range"
        title={`${category} premium range`}
      />
      <div className="flex flex-col gap-6">
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
      <SourceNote>
        All-time covers every exercise
        {allTimeRange ? ` from ${formatMonth(allTimeRange.first.month)}` : ""}.
        No exercises were held from April to June 2020.
      </SourceNote>
    </section>
  );
}
