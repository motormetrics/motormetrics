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
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { formatMonthShortName } from "@web/utils/dates/format-month";

/** The categories switched on, in LTA's order. */
const plottedOf = (selected: string[]) =>
  COE_CATEGORIES.filter((category) => selected.includes(category));

/** "Last 24 exercises", the chart card's description. */
export async function ResultsChartCount({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);

  return `Last ${exercises.length} exercises`;
}

/** The premium-by-exercise lines for whichever categories are switched on. */
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

  return <ResultsChart categories={plotted} data={chartData} ticks={ticks} />;
}
