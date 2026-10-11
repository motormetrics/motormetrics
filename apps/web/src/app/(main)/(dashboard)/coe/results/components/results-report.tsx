import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { CategoryBadge } from "@web/app/(main)/(dashboard)/coe/components/category-badge";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  type CoeExercise,
  changeRatio,
  formatExercise,
  formatExerciseTick,
  formatMonth,
  groupByExercise,
  recordHighs,
  successRate,
  summariseByYear,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { StatCell } from "@web/app/(main)/(dashboard)/coe/components/coe-headline";
import { PremiumDelta } from "@web/app/(main)/(dashboard)/coe/components/premium-delta";
import { SuccessRateCell } from "@web/app/(main)/(dashboard)/coe/components/success-rate-cell";
import { ResultsChart } from "@web/app/(main)/(dashboard)/coe/results/components/results-chart";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/coe/search-params";
import { ReportSection } from "@web/components/shared/report";
import {
  Count,
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";
import { Text } from "@web/components/shared/text";
import { getCoeResults, getCoeResultsByPeriod } from "@web/queries/coe";
import type { COECategory } from "@web/types";
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

/** The premium-by-exercise lines for whichever categories are switched on. */
export async function ResultsChartPanel({ searchParams }: RegionProps) {
  const { exercises, selected } = await loadExercises(searchParams);

  const plotted = COE_CATEGORIES.filter((category) =>
    selected.includes(category),
  );

  const chartData = exercises.map((exercise) => {
    const point: Record<string, number | string> = {
      label: formatExerciseTick(exercise),
    };

    for (const category of plotted) {
      point[category] = premiumOf(exercise, category) ?? 0;
    }

    return point;
  });

  return <ResultsChart categories={plotted} data={chartData} />;
}

/**
 * Only the rows. The table's own `<thead>` is static, so it stays in the page
 * shell and paints before these resolve.
 */
export async function ResultsByExerciseRows({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);

  const latest = exercises.at(-1);

  if (!latest) {
    return null;
  }

  const tableRows = exercises
    .map((exercise, index) => ({ exercise, previous: exercises[index - 1] }))
    .reverse();

  return tableRows.map(({ exercise, previous: earlier }) => (
    <ReportRow isActive={exercise.key === latest.key} key={exercise.key}>
      <ReportCell>
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-base">
            {formatMonth(exercise.month)}
          </span>
          <span className="font-medium text-muted text-xs">
            {biddingOrdinal(exercise.biddingNo)} bidding exercise
          </span>
        </div>
      </ReportCell>
      {COE_CATEGORIES.map((category) => {
        const premium = premiumOf(exercise, category);
        const earlierPremium = earlier && premiumOf(earlier, category);

        return (
          <ReportCell align="end" key={category}>
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-extrabold text-base">
                {premium === undefined ? "—" : formatCurrency(premium)}
              </span>
              <PremiumDelta
                className="text-xs"
                ratio={
                  premium !== undefined && earlierPremium
                    ? changeRatio(premium, earlierPremium)
                    : null
                }
              />
            </div>
          </ReportCell>
        );
      })}
      <ReportCell align="end" className="font-semibold text-muted">
        <Count value={totalFor(exercise, "bidsReceived")} />
      </ReportCell>
    </ReportRow>
  ));
}

/**
 * One row per calendar year across the whole dataset. It reads every result
 * rather than the selected period and takes no search params, so it
 * prerenders into the static shell.
 */
export async function PremiumsByYearRows() {
  const years = summariseByYear(groupByExercise(await getCoeResults()));

  return years.map(({ year, categories }) => (
    <ReportRow key={year}>
      <ReportCell className="font-bold text-base">{year}</ReportCell>
      {COE_CATEGORIES.map((category) => {
        const figures = categories[category];

        return (
          <ReportCell align="end" key={category}>
            {figures ? (
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-extrabold text-base">
                  {formatCurrency(figures.average)}
                </span>
                <span className="font-medium text-muted text-xs">
                  high {formatCurrency(figures.high)}
                </span>
              </div>
            ) : (
              "—"
            )}
          </ReportCell>
        );
      })}
    </ReportRow>
  ));
}

/** The highest closing premium each category has ever reached. */
export async function RecordHighRows() {
  const highs = recordHighs(groupByExercise(await getCoeResults()));

  return COE_CATEGORIES.map((category) => {
    const exercise = highs[category];

    return (
      <ReportRow key={category}>
        <ReportCell>
          <CategoryBadge categoryKey={toCategoryKey(category)} />
        </ReportCell>
        <ReportCell className="font-semibold text-base">
          {CATEGORY_DESCRIPTIONS[category]}
        </ReportCell>
        <ReportCell align="end" className="font-extrabold text-base">
          {exercise ? formatCurrency(premiumOf(exercise, category) ?? 0) : "—"}
        </ReportCell>
        <ReportCell className="font-semibold text-muted">
          {exercise ? formatExercise(exercise) : "—"}
        </ReportCell>
      </ReportRow>
    );
  });
}

/**
 * Quota against bids for the latest exercise. The section header names that
 * exercise, so unlike the table above it the heading is data-derived and the
 * whole section stays behind the boundary.
 */
export async function QuotaAndDemand({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);

  const latest = exercises.at(-1);

  if (!latest) {
    return null;
  }

  return (
    <ReportSection
      caption={`${formatMonth(latest.month)} · ${biddingOrdinal(latest.biddingNo)} bidding exercise`}
      title="Quota and demand"
    >
      <ReportTable
        columns={[
          { label: "Cat", width: "64px" },
          { label: "Description" },
          { align: "end", label: "Quota" },
          { align: "end", label: "Bids" },
          { label: "Success rate", width: "200px" },
        ]}
      >
        {COE_CATEGORIES.map((category) => {
          const figures = latest.results[category];
          const rate = successRate(
            figures?.bidsSuccess ?? 0,
            figures?.bidsReceived ?? 0,
          );

          return (
            <ReportRow key={category}>
              <ReportCell>
                <CategoryBadge categoryKey={toCategoryKey(category)} />
              </ReportCell>
              <ReportCell className="font-semibold text-base">
                {CATEGORY_DESCRIPTIONS[category]}
              </ReportCell>
              <ReportCell align="end" className="font-extrabold text-base">
                <Count value={figures?.quota ?? 0} />
              </ReportCell>
              <ReportCell align="end" className="font-semibold text-muted">
                <Count value={figures?.bidsReceived ?? 0} />
              </ReportCell>
              <ReportCell>
                <SuccessRateCell rate={rate} />
              </ReportCell>
            </ReportRow>
          );
        })}
      </ReportTable>
    </ReportSection>
  );
}
