import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  PremiumGapChart,
  type PremiumGapPoint,
} from "@web/app/(main)/(dashboard)/coe/category-merger/components/premium-gap-chart";
import { groupByExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { ReportStat } from "@web/components/shared/report";
import { getCoeResultsByPeriod } from "@web/queries/coe/historical-results";
import { formatChartMonth } from "@web/utils/dates/format-month";

/** Two exercises a month, so a year of them. */
const EXERCISES_PER_YEAR = 24;

const averageGap = (points: PremiumGapPoint[]): number =>
  points.reduce(
    (total, point) => total + point.categoryB - point.categoryA,
    0,
  ) / Math.max(points.length, 1);

/**
 * The evidence for LTA's case, from our own COE results: ten years of
 * Category A and B premiums, and how far apart they now close.
 */
export async function PremiumGap() {
  const exercises = groupByExercise(await getCoeResultsByPeriod("10y"));

  const points: PremiumGapPoint[] = exercises.flatMap(
    ({ biddingNo, month, results }) => {
      const categoryA = results["Category A"]?.premium;
      const categoryB = results["Category B"]?.premium;
      if (categoryA === undefined || categoryB === undefined) {
        return [];
      }
      return [
        {
          label: `${formatChartMonth(month, true)} #${biddingNo}`,
          categoryA,
          categoryB,
        },
      ];
    },
  );

  const latest = points.at(-1);
  if (!latest) {
    return null;
  }

  // The widest gap, not the gap a decade ago: the two closed close together
  // before 2021 as well, so a start-to-end comparison would understate how
  // far apart they ran in between.
  const widest = points.reduce((wide, point) =>
    point.categoryB - point.categoryA > wide.categoryB - wide.categoryA
      ? point
      : wide,
  );
  const pastYear = points.slice(-EXERCISES_PER_YEAR);
  const timesAAboveB = pastYear.filter(
    (point) => point.categoryA > point.categoryB,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PremiumGapChart data={points} />
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:flex-wrap sm:gap-0">
        <ReportStat
          label="Latest gap"
          note={latest.label}
          value={formatCurrency(latest.categoryB - latest.categoryA)}
        />
        <ReportStat
          label="Average gap, past year"
          note="Category B minus A"
          value={formatCurrency(Math.round(averageGap(pastYear)))}
        />
        <ReportStat
          label="Widest gap, ten years"
          note={widest.label}
          value={formatCurrency(widest.categoryB - widest.categoryA)}
        />
        <ReportStat
          label="Category A above B"
          note="exercises in the past year"
          value={String(timesAAboveB)}
        />
      </div>
      <Typography.Paragraph color="muted" size="sm">
        Closing premiums from LTA&apos;s bidding results, every exercise.
      </Typography.Paragraph>
    </div>
  );
}
