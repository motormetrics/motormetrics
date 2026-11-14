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
import { SourceNote } from "@web/components/shared/overview";
import { formatMonthShortName } from "@web/utils/dates/format-month";

/** The categories switched on, in LTA's order. */
const plottedOf = (selected: string[]) =>
  COE_CATEGORIES.filter((category) => selected.includes(category));

/** " · Last 26 exercises", after Figure 1's eyebrow. */
export async function ResultsChartCount({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);

  return ` · Last ${exercises.length} exercises`;
}

/** Figure 1's caption, for the categories switched on. */
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
