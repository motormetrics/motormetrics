import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  COE_CATEGORIES,
  formatMonth,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  ResultsChart,
  type ResultsPoint,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-chart";
import {
  loadExercises,
  premiumOf,
  type RegionProps,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import { SeriesFilter } from "@web/app/(main)/(dashboard)/coe/results/components/series-filter";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { formatMonthShortName } from "@web/utils/dates/format-month";

/**
 * The premium-by-exercise lines for whichever categories are switched on,
 * under a head naming the span and carrying the series toggles.
 */
export async function ResultsChartPanel({ searchParams }: RegionProps) {
  const { exercises, selected } = await loadExercises(searchParams);

  const plotted = COE_CATEGORIES.filter((category) =>
    selected.includes(category),
  );

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
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={
          first && latest
            ? `${formatMonth(first.month)} to ${formatMonth(latest.month)} · select categories to plot`
            : undefined
        }
        eyebrow={`Last ${exercises.length} exercises`}
        title="Closing premium by category"
        trailing={<SeriesFilter />}
      />
      <ResultsChart categories={plotted} data={chartData} ticks={ticks} />
      <SourceNote>
        Source: LTA via DataMall · Quota premium at the close of each exercise ·
        Y-axis does not start at zero
        {step ? `; gridlines every ${formatCurrency(step)}.` : "."} Category D
        premiums sit an order of magnitude below the car categories, so adding
        it flattens the other lines.
      </SourceNote>
    </section>
  );
}
