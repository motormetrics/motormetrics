import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  formatExercise,
  formatExerciseTick,
  premiumAxisTicks,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { coeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import {
  type CategoryMove,
  coeCaption,
  exerciseName,
  signed,
} from "@web/app/(main)/(dashboard)/components/market-copy";
import { PremiumTrendChart } from "@web/app/(main)/(dashboard)/components/premium-trend-chart";
import { LegendItem } from "@web/components/shared/legend-item";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { RangeBar } from "@web/components/shared/range-bar";
import { getCategoryExercises } from "@web/queries/coe";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import Link from "next/link";
import { createSerializer } from "nuqs/server";

/** A year of exercises: two a month. */
const EXERCISES = 24;

const serializeCoe = createSerializer(coeOverviewSearchParams);

/** The muted period that follows a section title. */
const PERIOD = "font-normal text-muted";

/**
 * Every category's latest premium, its change on the last exercise and where
 * it sits between the low and the high of the last 24 exercises. Each cell
 * opens that category on the COE page.
 */
export async function CoePremiumsFigure() {
  const series = await Promise.all(
    COE_CATEGORIES.map((category) => getCategoryExercises(category)),
  );

  const tiles = COE_CATEGORIES.flatMap((category, index) => {
    const window = series[index].slice(-EXERCISES);
    const latest = window.at(-1);
    if (!latest) {
      return [];
    }
    const premiums = window.map((exercise) => exercise.premium);
    return [
      {
        category,
        change: changeRatio(latest.premium, window.at(-2)?.premium) * 100,
        count: window.length,
        high: Math.max(...premiums),
        key: toCategoryKey(category),
        low: Math.min(...premiums),
        premium: latest.premium,
        start: window[0],
        latest,
      },
    ];
  });

  if (tiles.length === 0) {
    return null;
  }

  const moves: CategoryMove[] = tiles.map((tile) => ({
    change: tile.change,
    isHigh: tile.premium >= tile.high,
    isLow: tile.premium <= tile.low,
    key: tile.key,
    premium: tile.premium,
  }));
  const first = tiles[0];

  return (
    <section
      aria-labelledby="coe-premiums-heading"
      className="@container flex scroll-mt-24 flex-col gap-6"
      id="coe-premiums"
    >
      <SectionHead
        caption={coeCaption(moves, EXERCISES)}
        link={{ href: "/coe", label: "COE bidding results" }}
        title={
          <span id="coe-premiums-heading">
            COE premiums{" "}
            <span className={PERIOD}>{exerciseName(first.latest)}</span>
          </span>
        }
      />
      <ul className="grid @3xl:grid-cols-4 @md:grid-cols-2 grid-cols-1 @md:gap-x-6 @md:gap-y-8 @max-md:divide-y @max-md:divide-separator">
        {tiles.map((tile) => (
          <li key={tile.key}>
            <Link
              aria-label={`Category ${tile.key}, ${formatCurrency(tile.premium)}, open COE bidding results`}
              className="flex h-full @md:flex-col @md:justify-start justify-between gap-4 @max-md:py-4 text-foreground no-underline"
              href={serializeCoe("/coe", { category: tile.key })}
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-semibold text-sm">
                  Category {tile.key}
                </span>
                <span className="text-muted text-xs">
                  {CATEGORY_DESCRIPTIONS[tile.category]}
                </span>
              </span>
              <span className="@md:mt-auto flex shrink-0 flex-col gap-1 @max-md:text-right">
                <span className="font-bold text-2xl tabular-nums tracking-tight">
                  {formatCurrency(tile.premium)}
                </span>
                <span className="text-sm tabular-nums">
                  {signed(tile.change)}
                  <span className="@max-md:hidden"> on the last exercise</span>
                </span>
                <RangeBar
                  ariaLabel={`Against the last ${tile.count} exercises: low ${formatCurrency(tile.low)}, high ${formatCurrency(tile.high)}`}
                  className="@max-md:hidden"
                  high={tile.high}
                  highLabel={formatCurrency(tile.high)}
                  low={tile.low}
                  lowLabel={formatCurrency(tile.low)}
                  value={tile.premium}
                  where={null}
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <SourceNote>
        Source: LTA via DataMall · Quota premium at the close of the latest
        exercise. Each bar runs from the low to the high of the last {EXERCISES}{" "}
        exercises, {formatMonthLabel(first.start.month)} to{" "}
        {formatMonthLabel(first.latest.month)}. Select a category to open its
        results.
      </SourceNote>
    </section>
  );
}

/** Category A's closing premium over the last 24 exercises, as a line. */
export async function CategoryATrendFigure() {
  const window = (await getCategoryExercises("Category A")).slice(-EXERCISES);
  if (window.length < 2) {
    return null;
  }

  const data = window.map((exercise) => ({
    label: formatExerciseTick(exercise),
    premium: exercise.premium,
    title: formatExercise(exercise),
  }));
  const first = window[0];
  const latest = window[window.length - 1];

  return (
    <section
      aria-labelledby="category-a-trend-heading"
      className="flex scroll-mt-24 flex-col gap-6"
      id="category-a-trend"
    >
      <SectionHead
        title={
          <span id="category-a-trend-heading">
            Category A{" "}
            <span className={PERIOD}>last {window.length} exercises</span>
          </span>
        }
      />
      <LegendItem className="bg-chart-1" label="Category A premium" />
      <PremiumTrendChart
        ariaLabel={`Category A premium, ${exerciseName(first)} to ${exerciseName(latest)}`}
        data={data}
        ticks={premiumAxisTicks(window.map((exercise) => exercise.premium))}
      />
      <SourceNote>
        Source: LTA via DataMall · Quota premium at the close of each exercise,{" "}
        {exerciseName(first)} to {exerciseName(latest)}. The axis spans the
        data, not zero.
      </SourceNote>
    </section>
  );
}
