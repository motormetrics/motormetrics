"use client";

import { formatCurrency } from "@motormetrics/utils/format-currency";
import { useCoeOverview } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  changeRatio,
  formatExerciseTick,
  premiumAxisTicks,
  premiumRangeStats,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  averagePremium,
  type CoeOverviewData,
  categoryHistory,
  exerciseLabel,
  formatPercentChange,
  historyCaption,
} from "@web/app/(main)/(dashboard)/coe/components/overview-figures";
import type {
  CategoryKey,
  ExerciseRange,
} from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { PremiumTrendChart } from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-trend-chart";
import { LegendItem } from "@web/components/shared/legend-item";
import {
  SectionHead,
  SourceNote,
  StatCell,
} from "@web/components/shared/overview";

/**
 * The selected category's premium over the exercises shown, with a ruled
 * strip of its average, high, low and change under the chart. `data` holds
 * every category and the full history, so switching draws from props alone.
 */
export function PremiumsByExerciseView({
  categoryKey,
  data,
  range,
}: {
  categoryKey: CategoryKey;
  data: CoeOverviewData;
  range: ExerciseRange;
}) {
  const category = toCategory(categoryKey);
  const series = categoryHistory(data.history.slice(-Number(range)), category);
  const stats = premiumRangeStats(series);
  const ticks = premiumAxisTicks(series.map((exercise) => exercise.premium));
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : undefined;
  const first = series[0];
  const last = series.at(-1);

  return (
    <div className="flex flex-col gap-4">
      <SectionHead
        caption={historyCaption(category, series)}
        title={`${category}, last ${series.length} exercises`}
      />
      {stats && first && last ? (
        <>
          <LegendItem className="bg-chart-1" label={`${category} premium`} />
          <PremiumTrendChart
            data={series.map((exercise, index) => {
              const previous = series[index - 1];
              const [year, month] = exercise.month.split("-").map(Number);
              return {
                biddingNo: exercise.biddingNo,
                change: previous
                  ? changeRatio(exercise.premium, previous.premium)
                  : undefined,
                label: formatExerciseTick(exercise),
                monthIndex: year * 12 + month - 1,
                premium: exercise.premium,
                title: `${exerciseLabel(exercise)} · ${category}`,
              };
            })}
            label={category}
            tickMonths={series.length > 12 ? 2 : 1}
            ticks={ticks}
          />
          <div className="grid grid-cols-2 border-separator border-t md:grid-cols-4">
            <StatCell
              label={`${series.length}-exercise average`}
              note={`${exerciseLabel(first)} to ${exerciseLabel(last)}`}
              value={formatCurrency(averagePremium(series))}
            />
            <StatCell
              label={`${series.length}-exercise high`}
              note={exerciseLabel(stats.high)}
              value={formatCurrency(stats.high.premium)}
            />
            <StatCell
              label={`${series.length}-exercise low`}
              note={exerciseLabel(stats.low)}
              value={formatCurrency(stats.low.premium)}
            />
            <StatCell
              label={`Change over ${series.length}`}
              note={`from ${formatCurrency(first.premium)}`}
              value={formatPercentChange(stats.change)}
            />
          </div>
          <SourceNote>
            Source: LTA via DataMall · Quota premium at the close of each
            exercise, {exerciseLabel(first)} to {exerciseLabel(last)}. Y-axis
            does not start at zero
            {step ? `; gridlines every ${formatCurrency(step)}.` : "."} Hover or
            tap for values.
          </SourceNote>
        </>
      ) : null}
    </div>
  );
}

/** The history for the category in the URL; render inside `<Suspense>`. */
export function PremiumsByExerciseSelected({
  data,
}: {
  data: CoeOverviewData;
}) {
  const { category, range } = useCoeOverview();

  return (
    <PremiumsByExerciseView categoryKey={category} data={data} range={range} />
  );
}
