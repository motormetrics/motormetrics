import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  changeRatio,
  premiumAxisTicks,
  summariseCategoryExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { RangeTabs } from "@web/app/(main)/(dashboard)/coe/premiums/components/filters";
import {
  type PremiumPoint,
  PremiumTrendChart,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-trend-chart";
import { exerciseStamp } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-shared";
import {
  type PremiumRange,
  RANGE_EXERCISES,
} from "@web/app/(main)/(dashboard)/coe/premiums/search-params";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { CategoryExercise } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import { formatMonthShortName } from "@web/utils/dates/format-month";

/** Months between x ticks for each range, on desktop. */
const TICK_MONTHS: Record<PremiumRange, number> = {
  "1Y": 2,
  "3Y": 6,
  All: 24,
};

/** The category's premium by exercise over the chosen range, with a summary. */
export function PremiumsTrend({
  category,
  history,
  range,
}: {
  category: COECategory;
  /** Every exercise up to and including the selected one, oldest first. */
  history: CategoryExercise[];
  range: PremiumRange;
}) {
  const summary = summariseCategoryExercise(history, category);
  const series = history.slice(-RANGE_EXERCISES[range]);
  const chartData: PremiumPoint[] = series.map((exercise, index) => {
    const [yearPart, monthPart] = exercise.month.split("-").map(Number);
    const earlier = series[index - 1];
    return {
      biddingNo: exercise.biddingNo,
      change: earlier
        ? changeRatio(exercise.premium, earlier.premium)
        : undefined,
      label: formatMonthShortName(exercise.month),
      monthIndex: yearPart * 12 + monthPart - 1,
      premium: exercise.premium,
      title: exerciseStamp(exercise),
    };
  });
  const chartTicks = premiumAxisTicks(series.map(({ premium }) => premium));
  const chartStep =
    chartTicks.length > 1 ? chartTicks[1] - chartTicks[0] : undefined;
  const gridlines = chartStep
    ? `gridlines every ${formatCurrency(chartStep)}.`
    : "";
  const axisNote =
    (chartTicks[0] ?? 0) > 0
      ? `Y-axis does not start at zero; ${gridlines}`
      : `Starts at $0; ${gridlines}`;
  const firstPoint = chartData[0];
  const lastPoint = chartData.at(-1);

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={
          firstPoint && lastPoint
            ? `${series.length} exercises, ${firstPoint.title} to ${lastPoint.title}`
            : undefined
        }
        eyebrow="Premium history"
        title={`${category} premium by exercise`}
        trailing={<RangeTabs />}
      />
      <PremiumTrendChart
        data={chartData}
        tickMonths={TICK_MONTHS[range]}
        ticks={chartTicks}
      />
      {summary ? (
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {summary}
        </Typography.Paragraph>
      ) : null}
      <SourceNote>
        Source: LTA via DataMall · Quota premium at the close of each exercise ·{" "}
        {axisNote}
      </SourceNote>
    </section>
  );
}
