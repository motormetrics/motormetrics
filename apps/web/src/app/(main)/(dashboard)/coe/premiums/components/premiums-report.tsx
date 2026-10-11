import { cn, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { CategoryTabs } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  type ExercisePremium,
  formatExercise,
  formatMonth,
  formatPremiumChange,
  premiumAxisTicks,
  premiumRangeStats,
  successRate,
  toCategory,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { StatCell } from "@web/app/(main)/(dashboard)/coe/components/coe-headline";
import { SuccessRateCell } from "@web/app/(main)/(dashboard)/coe/components/success-rate-cell";
import { PremiumsCategoryTable } from "@web/app/(main)/(dashboard)/coe/premiums/components/categories-table";
import { RangeTabs } from "@web/app/(main)/(dashboard)/coe/premiums/components/filters";
import {
  type PremiumPoint,
  PremiumTrendChart,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-trend-chart";
import {
  loadSearchParams,
  type PremiumRange,
  RANGE_EXERCISES,
} from "@web/app/(main)/(dashboard)/coe/premiums/search-params";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import {
  Hairline,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import { getCategoryExercises, getExercisePair } from "@web/queries/coe";
import { formatMonthShortName } from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";

/** The comp lists a year of exercises under the chart. */
const HISTORY_ROWS = 12;

/** "Sep 2026 · 2nd", the short name for an exercise. */
const exerciseStamp = (exercise: { biddingNo: number; month: string }) =>
  `${formatMonth(exercise.month, "short")} · ${exercise.biddingNo === 1 ? "1st" : "2nd"}`;

/** Shared by the history header and rows, so the columns line up. */
const HISTORY_ROW =
  "flex items-center gap-4 border-separator border-b px-3 py-2.5 max-md:flex-wrap max-md:gap-y-1 max-md:px-2.5";
const HISTORY_PREMIUM = "w-32 shrink-0 text-right max-lg:w-28";
const HISTORY_CHANGE = "w-24 shrink-0 text-right max-lg:w-20";
const HISTORY_FIGURE = "w-20 shrink-0 text-right max-md:hidden";
const HISTORY_RATE = "w-48 shrink-0 max-lg:w-36 max-md:hidden";

/** Months between x ticks for each range, on desktop. */
const TICK_MONTHS: Record<PremiumRange, number> = {
  "1Y": 2,
  "3Y": 6,
  All: 24,
};

/**
 * One band of the premium-range block: where a window's low and high sit on a
 * track from $0 to the category's all-time high, with the exercise each was
 * set in.
 */
function PremiumRangeBar({
  high,
  label,
  low,
  scale,
}: {
  high: ExercisePremium;
  label: string;
  low: ExercisePremium;
  scale: number;
}) {
  const ceiling = scale || 1;
  const left = Math.min((low.premium / ceiling) * 100, 100);
  const width = Math.max(((high.premium - low.premium) / ceiling) * 100, 1);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-3">
        <span className="font-semibold text-sm">{label}</span>
        <SourceNote className="ml-auto whitespace-nowrap tabular-nums">
          spread {formatCurrency(high.premium - low.premium)}
        </SourceNote>
      </div>
      <div className="relative h-3 border-border border-l bg-surface-secondary">
        <span
          className="absolute inset-y-0 bg-chart-1"
          style={{ left: `${left.toFixed(1)}%`, width: `${width.toFixed(1)}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-3 text-muted-strong text-sm tabular-nums">
        <span>
          Low{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(low.premium)}
          </span>{" "}
          <span className="text-muted text-xs">{exerciseStamp(low)}</span>
        </span>
        <span className="ml-auto text-right">
          High{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(high.premium)}
          </span>{" "}
          <span className="text-muted text-xs">{exerciseStamp(high)}</span>
        </span>
      </div>
    </div>
  );
}

export async function PremiumsReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    category: categoryKey,
    month: parsedMonth,
    range,
  } = await loadSearchParams(searchParams);
  const category = toCategory(categoryKey);

  const [{ current, previous }, allExercises] = await Promise.all([
    getExercisePair(parsedMonth ?? undefined),
    getCategoryExercises(category),
  ]);

  if (!current) {
    return null;
  }

  // The selected exercise can sit mid-history when a month is picked, so the
  // series is truncated to it before anything is derived.
  const currentIndex = allExercises.findIndex(
    ({ biddingNo, month }) =>
      month === current.month && biddingNo === current.biddingNo,
  );
  const history =
    currentIndex >= 0 ? allExercises.slice(0, currentIndex + 1) : allExercises;
  const latest = history.at(-1);

  if (!latest) {
    return null;
  }

  const prior = history.at(-2) ?? null;
  const series = history.slice(-RANGE_EXERCISES[range]);
  const chartData: PremiumPoint[] = series.map((exercise, index) => {
    const [yearPart, monthPart] = exercise.month.split("-").map(Number);
    const earlier = series[index - 1];
    return {
      biddingNo: exercise.biddingNo,
      change: earlier
        ? changeRatio(exercise.premium, earlier.premium)
        : undefined,
      label: formatMonthShortName(exercise.month),
      monthIndex: yearPart * 12 + monthPart - 1,
      premium: exercise.premium,
      title: exerciseStamp(exercise),
    };
  });
  const chartTicks = premiumAxisTicks(series.map(({ premium }) => premium));
  const chartStep =
    chartTicks.length > 1 ? chartTicks[1] - chartTicks[0] : undefined;
  const gridlines = chartStep
    ? `gridlines every ${formatCurrency(chartStep)}.`
    : "";
  const axisNote =
    (chartTicks[0] ?? 0) > 0
      ? `Y-axis does not start at zero; ${gridlines}`
      : `Starts at $0; ${gridlines}`;
  const firstPoint = chartData[0];
  const lastPoint = chartData.at(-1);

  const year = Number(latest.month.slice(0, 4));
  const yearPremiums = history
    .filter(({ month }) => month.startsWith(`${year}-`))
    .map(({ premium }) => premium);
  const yearAverage = yearPremiums.length
    ? Math.round(
        yearPremiums.reduce((sum, premium) => sum + premium, 0) /
          yearPremiums.length,
      )
    : 0;
  const yearHigh = yearPremiums.length ? Math.max(...yearPremiums) : 0;
  const yearLow = yearPremiums.length ? Math.min(...yearPremiums) : 0;

  const allPremiums = allExercises.map(({ premium }) => premium);
  const allTimeHigh = allPremiums.length ? Math.max(...allPremiums) : 0;
  const yearRange = premiumRangeStats(
    history.filter(({ month }) => month.startsWith(`${year}-`)),
  );
  const allTimeRange = premiumRangeStats(allExercises);

  const currentRows = new Map(
    current.rows.map((row) => [row.vehicleClass, row]),
  );
  const previousRows = new Map(
    (previous?.rows ?? []).map((row) => [row.vehicleClass, row]),
  );

  const historyRows = history
    .map((exercise, index) => ({
      exercise,
      ratio:
        index > 0
          ? changeRatio(exercise.premium, history[index - 1].premium)
          : null,
    }))
    .slice(-HISTORY_ROWS)
    .reverse();

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-14">
        <div className="flex min-w-0 flex-col gap-3">
          <CategoryTabs selected={categoryKey} />
          <Text.Paragraph tone="strong">
            <span className="font-semibold text-accent-strong">{category}</span>
            {` · ${CATEGORY_DESCRIPTIONS[category]}`}
          </Text.Paragraph>
          <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
            <NumberValue
              currency="SGD"
              locale="en-SG"
              maximumFractionDigits={0}
              style="currency"
              value={latest.premium}
            />
          </span>
          <Typography.Paragraph className="tabular-nums" color="muted">
            {formatPremiumChange(latest.premium, prior ?? undefined)}
          </Typography.Paragraph>
        </div>

        <div className="grid grid-cols-2 border-separator border-t">
          <StatCell
            label="Previous exercise"
            note={
              prior
                ? `${formatMonth(prior.month, "short")} · ${biddingOrdinal(prior.biddingNo)}`
                : "None earlier"
            }
            value={prior ? formatCurrency(prior.premium) : "—"}
          />
          <StatCell
            label={`${year} average`}
            note={`${yearPremiums.length} exercises`}
            value={formatCurrency(yearAverage)}
          />
          <StatCell
            label={`${year} high`}
            note="year to date"
            value={formatCurrency(yearHigh)}
          />
          <StatCell
            label={`${year} low`}
            note="year to date"
            value={formatCurrency(yearLow)}
          />
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={
            firstPoint && lastPoint
              ? `${series.length} exercises, ${firstPoint.title} to ${lastPoint.title}`
              : undefined
          }
          eyebrow="Premium history"
          title={`${category} premium by exercise`}
          trailing={<RangeTabs />}
        />
        <PremiumTrendChart
          data={chartData}
          tickMonths={TICK_MONTHS[range]}
          ticks={chartTicks}
        />
        <SourceNote>
          Source: LTA via DataMall · Quota premium at the close of each exercise
          · {axisNote}
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption="Quota, bids and closing premium · select a row to chart it"
          eyebrow="All categories"
          title={formatExercise(current)}
        />
        <PremiumsCategoryTable
          rows={COE_CATEGORIES.map((entry) => {
            const row = currentRows.get(entry);
            const previousRow = previousRows.get(entry);
            return {
              bidsReceived: row?.bidsReceived ?? 0,
              changeRatio:
                row && previousRow
                  ? changeRatio(row.premium, previousRow.premium)
                  : null,
              description: CATEGORY_DESCRIPTIONS[entry],
              key: toCategoryKey(entry),
              premium: row?.premium ?? 0,
              quota: row?.quota ?? 0,
            };
          })}
          selected={categoryKey}
        />
        <SourceNote>
          Quota premium at the close of the exercise. Change is against the
          previous exercise; colour is not used for direction.
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`To ${formatExercise(current)} · most recent first`}
          eyebrow="Bidding history"
          title={`${category}, last ${historyRows.length} exercises`}
        />
        <div className="flex flex-col">
          <div
            className={cn(
              HISTORY_ROW,
              "items-end border-border pt-0 pb-2.5 font-semibold text-muted text-xs max-md:hidden",
            )}
          >
            <span className="min-w-0 flex-1">Exercise</span>
            <span className={HISTORY_PREMIUM}>Premium</span>
            <span className={HISTORY_CHANGE}>Change</span>
            <span className={HISTORY_FIGURE}>Quota</span>
            <span className={HISTORY_FIGURE}>Bids</span>
            <span className={HISTORY_RATE}>Success rate</span>
          </div>
          <span className="border-border border-b pb-2 font-semibold text-muted text-xs uppercase tracking-wide md:hidden">
            Exercise · premium
          </span>
          <ol className="flex flex-col">
            {historyRows.map(({ exercise, ratio }, index) => {
              const rate = successRate(
                exercise.bidsSuccess,
                exercise.bidsReceived,
              );

              return (
                <li
                  className={cn(
                    HISTORY_ROW,
                    index === 0 && "bg-surface-secondary",
                  )}
                  key={`${exercise.month}:${exercise.biddingNo}`}
                >
                  <span className="min-w-0 flex-1 font-medium text-sm">
                    {exerciseStamp(exercise)}
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5 md:contents">
                    <span
                      className={cn(
                        HISTORY_PREMIUM,
                        "font-semibold text-base tabular-nums max-md:w-auto",
                      )}
                    >
                      {formatCurrency(exercise.premium)}
                    </span>
                    <span
                      className={cn(
                        HISTORY_CHANGE,
                        "text-sm tabular-nums max-md:w-auto",
                      )}
                    >
                      {ratio === null || ratio === 0 ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <CostTrendChip changeRatio={ratio} />
                      )}
                    </span>
                  </span>
                  <span
                    className={cn(
                      HISTORY_FIGURE,
                      "text-muted-strong text-sm tabular-nums",
                    )}
                  >
                    {exercise.quota.toLocaleString("en-SG")}
                  </span>
                  <span
                    className={cn(
                      HISTORY_FIGURE,
                      "text-muted-strong text-sm tabular-nums",
                    )}
                  >
                    {exercise.bidsReceived.toLocaleString("en-SG")}
                  </span>
                  <span className={HISTORY_RATE}>
                    <SuccessRateCell rate={rate} />
                  </span>
                  <span className="w-full text-muted text-sm tabular-nums md:hidden">
                    {exercise.quota.toLocaleString("en-SG")} quota ·{" "}
                    {exercise.bidsReceived.toLocaleString("en-SG")} bids ·{" "}
                    {rate.toFixed(0)}% success
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <SourceNote>
          Success rate is successful bids as a share of bids received. Change is
          against the previous exercise.
        </SourceNote>
      </section>

      <Hairline />

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <section className="flex min-w-0 flex-col gap-4 lg:col-span-7">
          <SectionHead
            caption="Lowest to highest closing premium · shared scale from $0"
            eyebrow="Range"
            title={`${category} premium range`}
          />
          <div className="flex flex-col gap-6">
            {yearRange ? (
              <PremiumRangeBar
                high={yearRange.high}
                label={`${year} year to date`}
                low={yearRange.low}
                scale={allTimeHigh}
              />
            ) : null}
            {allTimeRange ? (
              <PremiumRangeBar
                high={allTimeRange.high}
                label="All-time"
                low={allTimeRange.low}
                scale={allTimeHigh}
              />
            ) : null}
          </div>
          <SourceNote>
            All-time covers every exercise
            {allTimeRange
              ? ` from ${formatMonth(allTimeRange.first.month)}`
              : ""}
            . No exercises were held from April to June 2020.
          </SourceNote>
        </section>

        <section className="flex min-w-0 flex-col gap-4 lg:col-span-5">
          <SectionHead
            eyebrow="Reading the numbers"
            title="How premiums are set"
          />
          <Typography.Paragraph className="text-muted-strong">
            A premium is the price of the last successful bid in an exercise, so
            it is set by demand rather than announced in advance.
          </Typography.Paragraph>
          <Typography.Paragraph className="text-muted-strong">
            Renewing an existing COE uses the PQP instead: the three-month
            moving average of premiums in that category.
          </Typography.Paragraph>
          <div className="flex flex-col items-start gap-2">
            <SectionLink className="ml-0" href="/coe/pqp">
              PQP rates
            </SectionLink>
            <SectionLink className="ml-0" href="/coe/results">
              Results by exercise
            </SectionLink>
          </div>
        </section>
      </div>
    </>
  );
}
