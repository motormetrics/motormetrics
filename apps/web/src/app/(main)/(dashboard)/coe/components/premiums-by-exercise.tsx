import { RangeTabs } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  changeRatio,
  formatExerciseTick,
  groupByExercise,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import {
  ColumnChart,
  type ColumnChartColumn,
} from "@web/components/shared/column-chart";
import { SectionHead } from "@web/components/shared/overview";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

const formatMoney = (value: number) =>
  `$${Math.round(value).toLocaleString("en-SG")}`;

const formatChange = (ratio: number) =>
  `${ratio >= 0 ? "+" : "−"}${Math.abs(ratio * 100).toFixed(1)}%`;

export async function PremiumsByExercise({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category: categoryKey, range }, results] = await Promise.all([
    loadCoeOverviewSearchParams(searchParams),
    getCoeResults(),
  ]);

  const category = toCategory(categoryKey);
  const exercises = groupByExercise(results).filter(
    (exercise) => exercise.results[category] !== undefined,
  );
  // One extra exercise so the first visible column still has a baseline to
  // measure its change against.
  const visible = exercises.slice(-(Number(range) + 1));

  const columns: ColumnChartColumn[] = visible
    .map((exercise, index) => {
      const premium = exercise.results[category]?.premium ?? 0;
      const label = formatExerciseTick(exercise);
      return {
        key: exercise.key,
        label,
        tooltip: {
          rows: [
            { label: "Premium", value: formatMoney(premium) },
            {
              label: "Change",
              value: formatChange(
                changeRatio(
                  premium,
                  visible[index - 1]?.results[category]?.premium ?? 0,
                ),
              ),
            },
          ],
          title: `${label} · ${category}`,
        },
        value: premium,
      };
    })
    .slice(-Number(range));

  return (
    <div className="flex flex-col gap-7">
      <SectionHead
        caption={`${category} · hover a column for the premium`}
        eyebrow="Bidding history"
        size="lg"
        title="Premiums by exercise"
        trailing={<RangeTabs />}
      />
      {columns.length > 0 ? (
        <ColumnChart baseline="trimmed" columns={columns} height={260} />
      ) : null}
    </div>
  );
}
