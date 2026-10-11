import { cn, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  type CoeExercise,
  changeRatio,
  formatExercise,
  formatMonth,
  groupByExercise,
  recordHighs,
  successRate,
  summariseByYear,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { SuccessRateCell } from "@web/app/(main)/(dashboard)/coe/components/success-rate-cell";
import {
  ResultsChart,
  type ResultsPoint,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-chart";
import { SeriesFilter } from "@web/app/(main)/(dashboard)/coe/results/components/series-filter";
import { ShowMoreRows } from "@web/app/(main)/(dashboard)/coe/results/components/show-more-rows";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/coe/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import {
  SectionHead,
  SourceNote,
  StatCell,
} from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import { getCoeResults, getCoeResultsByPeriod } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import { formatMonthShortName } from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";

/** The three categories the comp calls out beside the headline. */
const HIGHLIGHT_CATEGORIES: COECategory[] = [
  "Category A",
  "Category B",
  "Category E",
];

const premiumOf = (exercise: CoeExercise, category: COECategory) =>
  exercise.results[category]?.premium;

/** "−1.2% on the previous exercise", or a note that there is no baseline. */
function movementNote(current: number, previous?: number): string {
  if (!previous) {
    return "no earlier exercise";
  }

  const percent = changeRatio(current, previous) * 100;
  const sign = percent > 0 ? "+" : percent < 0 ? "−" : "";

  return `${sign}${Math.abs(percent).toFixed(1)}% on the previous exercise`;
}

/** Sum one figure across every category in an exercise. */
function totalFor(
  exercise: CoeExercise,
  figure: "bidsReceived" | "bidsSuccess" | "quota",
): number {
  return COE_CATEGORIES.reduce(
    (total, category) => total + (exercise.results[category]?.[figure] ?? 0),
    0,
  );
}

interface RegionProps {
  searchParams: Promise<SearchParams>;
}

/**
 * The read every region below shares.
 *
 * Each region awaits this itself rather than taking the data as a prop, so the
 * regions sit behind their own Suspense boundaries and stream independently —
 * the page never waits on the slowest of them. It is not one query per region:
 * `getCoeResultsByPeriod` is `'use cache'`, so the first call populates and the
 * rest read it.
 */
async function loadExercises(searchParams: Promise<SearchParams>) {
  const { categories: selected, period } = await loadSearchParams(searchParams);

  return {
    exercises: groupByExercise(await getCoeResultsByPeriod(period)),
    selected,
  };
}

/** Names the exercise the page leads with, and its source. */
export async function LatestExerciseSub({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);
  const latest = exercises.at(-1);

  return latest ? (
    <>
      Latest:{" "}
      <span className="font-semibold text-foreground">
        {formatExercise(latest)}
      </span>{" "}
      · Source: LTA via DataMall
    </>
  ) : null;
}

/**
 * The opening block: bids per quota across every category in the latest
 * exercise, and a ruled grid of the car premiums and the quota beside it.
 * Stacks into one column below lg.
 */
export async function ResultsHeadline({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);

  const latest = exercises.at(-1);
  const previous = exercises.at(-2);

  if (!latest) {
    return null;
  }

  const totalQuota = totalFor(latest, "quota");
  const totalBids = totalFor(latest, "bidsReceived");
  const bidsPerQuota = totalQuota > 0 ? totalBids / totalQuota : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-14">
      <div className="flex min-w-0 flex-col gap-3">
        <Text.Paragraph tone="strong">
          <span className="font-semibold text-accent-strong">
            Bids per quota
          </span>{" "}
          · all five categories
        </Text.Paragraph>
        <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
          {bidsPerQuota.toFixed(2)}×
        </span>
        <Typography.Paragraph className="tabular-nums" color="muted">
          <span className="font-semibold text-foreground">
            {totalBids.toLocaleString("en-SG")}
          </span>{" "}
          bids against a quota of{" "}
          <span className="font-semibold text-foreground">
            {totalQuota.toLocaleString("en-SG")}
          </span>
        </Typography.Paragraph>
      </div>

      <div className="grid grid-cols-2 border-separator border-t">
        {HIGHLIGHT_CATEGORIES.map((category) => {
          const premium = premiumOf(latest, category) ?? 0;
          return (
            <StatCell
              key={category}
              label={`${category} premium`}
              note={movementNote(
                premium,
                previous && premiumOf(previous, category),
              )}
              value={formatCurrency(premium)}
            />
          );
        })}
        <StatCell
          label="Quota"
          note="this exercise"
          value={totalQuota.toLocaleString("en-SG")}
        />
      </div>
    </div>
  );
}

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

/** Shared by the column header and every row, so the columns line up. */
const EXERCISE_ROW =
  "flex items-center gap-3 border-separator border-b px-3 py-2.5 max-md:px-1.5";
const EXERCISE_CELL =
  "flex w-28 shrink-0 flex-col items-end gap-px max-lg:w-24 max-md:w-16";
const BIDS_CELL = "w-24 shrink-0 text-right max-xl:hidden";
/** The yearly list's phone fold: a narrow year, the cells sharing the rest. */
const YEAR_LABEL = "max-md:w-10 max-md:flex-none";
const YEAR_CELL = "max-md:w-auto max-md:min-w-0 max-md:flex-1";
/** Categories C and D are dropped on phones, leaving the car categories. */
const PHONE_HIDDEN: COECategory[] = ["Category C", "Category D"];

/**
 * Every exercise in the period, most recent first, with each category's
 * change on the exercise before. The first twelve show until expanded.
 */
export async function ResultsByExercise({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);

  const latest = exercises.at(-1);

  if (!latest) {
    return null;
  }

  const rows = exercises
    .map((exercise, index) => ({ exercise, previous: exercises[index - 1] }))
    .reverse()
    .map(({ exercise, previous: earlier }) => (
      <li
        className={cn(
          EXERCISE_ROW,
          exercise.key === latest.key && "bg-surface-secondary",
        )}
        key={exercise.key}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="whitespace-nowrap font-semibold text-sm">
            <span className="max-md:hidden">{formatMonth(exercise.month)}</span>
            <span className="md:hidden">
              {formatMonth(exercise.month, "short")}
            </span>
          </span>
          <span className="text-muted text-xs">
            {exercise.biddingNo === 1 ? "1st" : "2nd"}
            <span className="max-md:hidden"> bidding exercise</span>
          </span>
        </span>
        {COE_CATEGORIES.map((category) => {
          const premium = premiumOf(exercise, category);
          const earlierPremium = earlier && premiumOf(earlier, category);
          return (
            <span
              className={cn(
                EXERCISE_CELL,
                PHONE_HIDDEN.includes(category) && "max-md:hidden",
              )}
              key={category}
            >
              <span className="font-semibold text-base tabular-nums max-md:text-sm">
                {premium === undefined ? "—" : formatCurrency(premium)}
              </span>
              <span className="text-muted text-xs tabular-nums">
                {premium !== undefined && earlierPremium ? (
                  <CostTrendChip
                    changeRatio={changeRatio(premium, earlierPremium)}
                  />
                ) : (
                  "—"
                )}
              </span>
            </span>
          );
        })}
        <span
          className={cn(BIDS_CELL, "text-muted-strong text-sm tabular-nums")}
        >
          {totalFor(exercise, "bidsReceived").toLocaleString("en-SG")}
        </span>
      </li>
    ));

  return (
    <ShowMoreRows
      header={<CategoryHeader label="Exercise" trailing="Total bids" />}
      initial={12}
      lessLabel="Show 12 exercises"
      moreLabel={`Show all ${rows.length} exercises`}
      noun="exercises"
      rows={rows}
    >
      <span className="md:hidden">
        Categories C and D appear on wider screens.
      </span>
    </ShowMoreRows>
  );
}

/** The column header for the category-by-column lists. */
function CategoryHeader({
  isYear = false,
  label,
  trailing,
}: {
  /** Folds like the yearly rows on phones. */
  isYear?: boolean;
  label: string;
  trailing?: string;
}) {
  return (
    <div
      className={cn(
        EXERCISE_ROW,
        "items-end border-border pt-0 font-semibold text-muted text-xs",
      )}
    >
      <span className={cn("min-w-0 flex-1", isYear && YEAR_LABEL)}>
        {label}
      </span>
      {COE_CATEGORIES.map((category) => (
        <span
          className={cn(
            EXERCISE_CELL,
            isYear && YEAR_CELL,
            PHONE_HIDDEN.includes(category) && "max-md:hidden",
          )}
          key={category}
        >
          Cat {toCategoryKey(category)}
        </span>
      ))}
      {trailing ? <span className={BIDS_CELL}>{trailing}</span> : null}
    </div>
  );
}

/**
 * One row per calendar year across the whole dataset, newest first: the mean
 * closing premium and the year's high. It reads every result rather than the
 * selected period and takes no search params, so it prerenders into the
 * static shell.
 */
export async function PremiumsByYear() {
  const years = summariseByYear(groupByExercise(await getCoeResults()));
  const newest = years[0]?.year;
  const oldest = years.at(-1)?.year;
  const shown = 6;

  const rows = years.map(({ year, categories }) => (
    <li className={EXERCISE_ROW} key={year}>
      <span
        className={cn(
          "min-w-0 flex-1 font-semibold text-sm tabular-nums",
          YEAR_LABEL,
        )}
      >
        {year}
      </span>
      {COE_CATEGORIES.map((category) => {
        const figures = categories[category];
        return (
          <span
            className={cn(
              EXERCISE_CELL,
              YEAR_CELL,
              PHONE_HIDDEN.includes(category) && "max-md:hidden",
            )}
            key={category}
          >
            <span className="font-semibold text-base tabular-nums max-md:text-sm">
              {figures ? formatCurrency(figures.average) : "—"}
            </span>
            <span className="whitespace-nowrap text-muted text-xs tabular-nums">
              {figures ? `high ${formatCurrency(figures.high)}` : "—"}
            </span>
          </span>
        );
      })}
    </li>
  ));

  return (
    <ShowMoreRows
      header={<CategoryHeader isYear label="Year" />}
      initial={shown}
      lessLabel={`Show ${years[shown - 1]?.year} to ${newest}`}
      moreLabel={`Show every year since ${oldest}`}
      noun="years"
      rows={rows}
    >
      No exercises were held from April to June 2020, so 2020 averages 18
      exercises.
    </ShowMoreRows>
  );
}

/** Shared by the records header and rows. */
const RECORD_ROW =
  "flex items-baseline gap-4 border-separator border-b px-3 py-3 max-md:flex-wrap max-md:gap-x-3 max-md:gap-y-0.5 max-md:px-1.5";

/** The highest closing premium each category has ever reached. */
export async function RecordHighs() {
  const highs = recordHighs(groupByExercise(await getCoeResults()));

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          RECORD_ROW,
          "items-end border-border pt-0 font-semibold text-muted text-xs max-md:hidden",
        )}
      >
        <span className="w-24 shrink-0">Category</span>
        <span className="min-w-0 flex-1">Description</span>
        <span className="w-32 shrink-0 text-right">Record</span>
        <span className="w-60 shrink-0 text-right">Exercise</span>
      </div>
      <ol className="flex flex-col">
        {COE_CATEGORIES.map((category) => {
          const exercise = highs[category];
          return (
            <li className={RECORD_ROW} key={category}>
              <span className="w-24 shrink-0 whitespace-nowrap font-semibold text-sm max-md:w-auto max-md:flex-1">
                {category}
              </span>
              <span className="min-w-0 flex-1 truncate text-muted text-sm max-md:hidden">
                {CATEGORY_DESCRIPTIONS[category]}
              </span>
              <span className="w-32 shrink-0 text-right font-semibold text-base tabular-nums max-md:w-auto">
                {exercise
                  ? formatCurrency(premiumOf(exercise, category) ?? 0)
                  : "—"}
              </span>
              <span className="w-60 shrink-0 text-right text-muted-strong text-sm max-md:w-full max-md:text-left max-md:text-xs">
                {exercise ? formatExercise(exercise) : "—"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Shared by the quota header and rows. */
const QUOTA_ROW =
  "flex items-center gap-3.5 border-separator border-b py-3 max-md:gap-2.5";
const QUOTA_CELL = "w-16 shrink-0 text-right";

/**
 * Quota against bids for the latest exercise. The heading names that
 * exercise, so unlike the tables above it the whole section is data-derived
 * and stays behind the boundary.
 */
export async function QuotaAndDemand({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);

  const latest = exercises.at(-1);

  if (!latest) {
    return null;
  }

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption="Bids received against quota, by category"
        eyebrow="Quota and demand"
        title={formatExercise(latest)}
      />
      <div className="flex flex-col">
        <div
          className={cn(
            QUOTA_ROW,
            "border-border pt-0 pb-2 font-semibold text-muted text-xs",
          )}
        >
          <span className="w-14 shrink-0 max-md:w-8">Cat</span>
          <span className="min-w-0 flex-1">
            <span className="max-md:hidden">Description</span>
          </span>
          <span className={QUOTA_CELL}>Quota</span>
          <span className={QUOTA_CELL}>Bids</span>
          <span className="w-44 shrink-0 max-md:hidden">Success rate</span>
        </div>
        <ol className="flex flex-col">
          {COE_CATEGORIES.map((category) => {
            const figures = latest.results[category];
            const rate = successRate(
              figures?.bidsSuccess ?? 0,
              figures?.bidsReceived ?? 0,
            );

            return (
              <li className={QUOTA_ROW} key={category}>
                <span className="w-14 shrink-0 font-semibold text-sm max-md:w-8">
                  {toCategoryKey(category)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col text-muted-strong text-sm">
                  <span className="truncate max-md:whitespace-normal">
                    {CATEGORY_DESCRIPTIONS[category]}
                  </span>
                  <span className="text-muted text-xs tabular-nums md:hidden">
                    {rate.toFixed(0)}% success
                  </span>
                </span>
                <span
                  className={cn(
                    QUOTA_CELL,
                    "font-semibold text-sm tabular-nums",
                  )}
                >
                  {(figures?.quota ?? 0).toLocaleString("en-SG")}
                </span>
                <span
                  className={cn(
                    QUOTA_CELL,
                    "text-muted-strong text-sm tabular-nums",
                  )}
                >
                  {(figures?.bidsReceived ?? 0).toLocaleString("en-SG")}
                </span>
                <span className="w-44 shrink-0 max-md:hidden">
                  <SuccessRateCell rate={rate} />
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <SourceNote>
        Success rate is successful bids as a share of bids received.
      </SourceNote>
    </section>
  );
}
