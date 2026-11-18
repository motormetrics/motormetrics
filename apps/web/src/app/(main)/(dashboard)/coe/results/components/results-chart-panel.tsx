import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  COE_CATEGORIES,
  formatMonth,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { chartCaption } from "@web/app/(main)/(dashboard)/coe/results/components/results-captions";
import {
  ResultsChart,
  type ResultsPoint,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-chart";
import {
  loadExercises,
  premiumOf,
  type RegionProps,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { LegendItem } from "@web/components/shared/legend-item";
import { SourceNote } from "@web/components/shared/overview";
import type { COECategory } from "@web/types";
import { formatMonthShortName } from "@web/utils/dates/format-month";

/** The categories switched on, in LTA's order. */
const plottedOf = (selected: string[]) =>
  COE_CATEGORIES.filter((category) => selected.includes(category));

/** One swatch class per category, in the order of `CATEGORY_COLOURS`. */
const LEGEND_CLASSES: Record<COECategory, string> = {
  "Category A": "bg-chart-1",
  "Category B": "bg-chart-2",
  "Category C": "bg-chart-3",
  "Category D": "bg-chart-4",
  "Category E": "bg-chart-5",
};

/** The legend for the categories switched on. */
export async function ResultsChartLegend({ searchParams }: RegionProps) {
  const { selected } = await loadExercises(searchParams);

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {plottedOf(selected).map((category) => (
        <LegendItem
          className={LEGEND_CLASSES[category]}
          key={category}
          label={category}
        />
      ))}
    </div>
  );
}

/** The premium trend's caption, for the categories switched on. */
export async function ResultsChartCaption({ searchParams }: RegionProps) {
  const { exercises, selected } = await loadExercises(searchParams);

  return chartCaption(exercises, plottedOf(selected)) ?? null;
}

/**
 * The premium-by-exercise lines for whichever categories are switched on,
 * with the source line, whose gridline step follows the plotted series.
 */
export async function ResultsChartPanel({ searchParams }: RegionProps) {
  const { exercises, selected } = await loadExercises(searchParams);

  const plotted = plottedOf(selected);

  const chartData: ResultsPoint[] = exercises.map((exercise) => {
    const [year, month] = exercise.month.split("-").map(Number);
    const point: ResultsPoint = {
      biddingNo: exercise.biddingNo,
      label: formatMonthShortName(exercise.month),
      monthIndex: year * 12 + month - 1,
      title: `${formatMonth(exercise.month, "short")} · ${exercise.biddingNo === 1 ? "1st" : "2nd"}`,
    };

    for (const category of plotted) {
      point[category] = premiumOf(exercise, category) ?? 0;
    }

    return point;
  });
  const ticks = axisTicks(
    chartData.flatMap((point) =>
      plotted.map((category) => Number(point[category])),
    ),
    { zero: false },
  );
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : undefined;
  const first = exercises[0];
  const latest = exercises.at(-1);

  return (
    <>
      <ResultsChart categories={plotted} data={chartData} ticks={ticks} />
      <SourceNote>
        Source: LTA via DataMall · Quota premium at the close of each exercise
        {first && latest
          ? `, ${formatMonth(first.month)} to ${formatMonth(latest.month)}`
          : ""}
        . Y-axis does not start at zero
        {step ? `; gridlines every ${formatCurrency(step)}.` : "."} Category D
        premiums sit an order of magnitude below the car categories, so adding
        it flattens the other lines. Hover or tap for values.
      </SourceNote>
    </>
  );
}
