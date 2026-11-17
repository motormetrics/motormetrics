import {
  changeRatio,
  premiumAxisTicks,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  type PremiumPoint,
  PremiumTrendChart,
} from "@web/app/(main)/(dashboard)/coe/components/premium-trend-chart";
import { exerciseStamp } from "@web/app/(main)/(dashboard)/coe/components/premiums-shared";
import { FigureCard } from "@web/components/shared/figure-card";
import { getCategoryExercises } from "@web/queries/coe";
import { formatMonthShortName } from "@web/utils/dates/format-month";

/** A year of exercises: two a month. */
const EXERCISES = 24;

/** "2026-11#1": one exercise, matched across categories. */
const exerciseKey = (exercise: { biddingNo: number; month: string }) =>
  `${exercise.month}#${exercise.biddingNo}`;

/**
 * Category A and B premiums over the last year of exercises, the two car
 * categories most visitors come for. The other categories are on /coe.
 */
export async function CoePremiumsCard() {
  const [categoryA, categoryB] = await Promise.all([
    getCategoryExercises("Category A"),
    getCategoryExercises("Category B"),
  ]);

  const series = categoryA.slice(-EXERCISES);
  if (series.length === 0) {
    return null;
  }
  const premiumB = new Map(
    categoryB.map((exercise) => [exerciseKey(exercise), exercise.premium]),
  );

  const data: PremiumPoint[] = series.map((exercise, index) => {
    const [year, month] = exercise.month.split("-").map(Number);
    const earlier = series[index - 1];
    return {
      biddingNo: exercise.biddingNo,
      change: earlier
        ? changeRatio(exercise.premium, earlier.premium)
        : undefined,
      label: formatMonthShortName(exercise.month),
      monthIndex: year * 12 + month - 1,
      pairedPremium: premiumB.get(exerciseKey(exercise)),
      premium: exercise.premium,
      title: exerciseStamp(exercise),
    };
  });

  // The chart scales to `premium` alone; Category B needs room on the axis too.
  const ticks = premiumAxisTicks(
    data.flatMap((point) => [
      point.premium,
      point.pairedPremium ?? point.premium,
    ]),
  );

  return (
    <FigureCard
      description={<>Category A and B, last {series.length} exercises</>}
      link={{ href: "/coe/results", label: "All COE results" }}
      title="COE premiums"
    >
      <PremiumTrendChart
        data={data}
        label="Category A"
        pairedLabel="Category B"
        tickMonths={2}
        ticks={ticks}
      />
    </FigureCard>
  );
}
