import { formatCurrency } from "@motormetrics/utils/format-currency";
import { RangeTabs } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  changeRatio,
  type ExercisePremium,
  formatExerciseTick,
  groupByExercise,
  pairedCategories,
  premiumAxisTicks,
  premiumRangeStats,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { PremiumTrendChart } from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-trend-chart";
import {
  SectionHead,
  SourceNote,
  StatCell,
} from "@web/components/shared/overview";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

/** "Sep 2 2026" — an exercise named with its year, for the stats strip. */
const exerciseWithYear = (exercise: ExercisePremium): string =>
  `${formatExerciseTick(exercise)} ${exercise.month.slice(0, 4)}`;

/** "+3.0%", with a true minus for a fall and no colour. */
const formatChange = (ratio: number): string =>
  `${ratio < 0 ? "−" : "+"}${Math.abs(ratio * 100).toFixed(1)}%`;

/**
 * The /coe bidding history: the selected category's premium across the chosen
 * range of exercises, with a ruled strip of its latest, high, low and change.
 * The strip goes two-by-two at 720px and below.
 */
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
  // A and B share the chart until the merger; the selected one leads.
  const paired = pairedCategories(category).find(
    (shownCategory) => shownCategory !== category,
  );
  const exercises = groupByExercise(results).flatMap((exercise) => {
    const premium = exercise.results[category]?.premium;
    return premium === undefined
      ? []
      : [
          {
            biddingNo: exercise.biddingNo,
            month: exercise.month,
            pairedPremium: paired
              ? exercise.results[paired]?.premium
              : undefined,
            premium,
          },
        ];
  });
  // One extra exercise so the first visible point still has a previous
  // exercise to measure its change against.
  const withBaseline = exercises.slice(-(Number(range) + 1));
  const view = withBaseline.slice(-Number(range));
  const offset = withBaseline.length - view.length;
  const stats = premiumRangeStats(view);
  const ticks = premiumAxisTicks(
    view.flatMap((exercise) =>
      exercise.pairedPremium === undefined
        ? [exercise.premium]
        : [exercise.premium, exercise.pairedPremium],
    ),
  );
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : undefined;

  return (
    <div className="flex flex-col gap-5">
      {/* At 720px and below the trailing slot spans the row so the switch can. */}
      <SectionHead
        // Every tab keeps the same title, caption and legend shape, so
        // switching category never changes their wrapped height.
        caption={`Stats for ${category} · change category above or in the table`}
        className="max-[720px]:[&>:last-child]:w-full"
        eyebrow="Bidding history"
        title={
          paired
            ? "Cat A and B premiums by exercise"
            : `${category} premium by exercise`
        }
        trailing={<RangeTabs />}
      />
      {stats ? (
        <>
          <div className="grid grid-cols-2 border-separator border-t min-[721px]:grid-cols-4 min-[721px]:[&>:nth-child(3)]:border-l min-[721px]:[&>:nth-child(3)]:pl-4">
            <StatCell
              label="Latest"
              note={exerciseWithYear(stats.latest)}
              value={formatCurrency(stats.latest.premium)}
            />
            <StatCell
              label="High"
              note={exerciseWithYear(stats.high)}
              value={formatCurrency(stats.high.premium)}
            />
            <StatCell
              label="Low"
              note={exerciseWithYear(stats.low)}
              value={formatCurrency(stats.low.premium)}
            />
            <StatCell
              label={`Change over ${view.length} exercises`}
              note={`from ${formatCurrency(stats.first.premium)}`}
              value={formatChange(stats.change)}
            />
          </div>
          <div className="flex gap-4 text-muted-strong text-xs">
            {[
              { color: "var(--chart-1)", name: category },
              ...(paired ? [{ color: "var(--chart-2)", name: paired }] : []),
            ].map((series) => (
              <span
                className="inline-flex items-center gap-1.5"
                key={series.name}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-3 rounded-xs"
                  style={{ background: series.color }}
                />
                {series.name}
              </span>
            ))}
          </div>
          <PremiumTrendChart
            data={view.map((exercise, index) => {
              const previous = withBaseline[index + offset - 1];
              return {
                change: previous
                  ? changeRatio(exercise.premium, previous.premium)
                  : undefined,
                label: formatExerciseTick(exercise),
                pairedPremium: exercise.pairedPremium,
                premium: exercise.premium,
                title: paired
                  ? exerciseWithYear(exercise)
                  : `${exerciseWithYear(exercise)} · ${category}`,
              };
            })}
            label={paired ? category : undefined}
            pairedLabel={paired}
            ticks={ticks}
          />
          {/* Holds three lines on phones, however long the gridline step. */}
          <SourceNote className="max-md:min-h-16">
            Source: LTA via DataMall · Quota premium at close of each exercise ·
            Y-axis does not start at zero
            {step ? `; gridlines every ${formatCurrency(step)}.` : "."}
          </SourceNote>
        </>
      ) : null}
    </div>
  );
}
