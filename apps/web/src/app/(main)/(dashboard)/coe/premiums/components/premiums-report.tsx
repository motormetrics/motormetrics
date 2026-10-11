import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { CategoryTabs } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  formatExercise,
  formatMonth,
  formatPremiumChange,
  premiumAxisTicks,
  successRate,
  toCategory,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { StatCell } from "@web/app/(main)/(dashboard)/coe/components/coe-headline";
import { PremiumDelta } from "@web/app/(main)/(dashboard)/coe/components/premium-delta";
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
import {
  Hairline,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import { ReportNote, ReportSection } from "@web/components/shared/report";
import {
  Count,
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";
import { Text } from "@web/components/shared/text";
import { getCategoryExercises, getExercisePair } from "@web/queries/coe";
import { formatMonthShortName } from "@web/utils/dates/format-month";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

/** The comp lists a year of exercises under the chart. */
const HISTORY_ROWS = 12;

/** "Sep 2026 · 2nd", the short name for an exercise. */
const exerciseStamp = (exercise: { biddingNo: number; month: string }) =>
  `${formatMonth(exercise.month, "short")} · ${exercise.biddingNo === 1 ? "1st" : "2nd"}`;

/** Months between x ticks for each range, on desktop. */
const TICK_MONTHS: Record<PremiumRange, number> = {
  "1Y": 2,
  "3Y": 6,
  All: 24,
};

/**
 * One band of the premium-range block: where a window's low and high sit on a
 * track scaled to the category's all-time high.
 */
function PremiumRangeBar({
  high,
  label,
  low,
  scale,
}: {
  high: number;
  label: string;
  low: number;
  scale: number;
}) {
  const ceiling = scale || 1;
  const left = Math.min((low / ceiling) * 100, 100);
  const width = Math.max(((high - low) / ceiling) * 100, 2);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline gap-4">
        <span className="font-bold text-base text-foreground">{label}</span>
        <span className="ml-auto whitespace-nowrap font-semibold text-muted text-sm">
          spread {formatCurrency(high - low)}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-surface-secondary">
        <span
          className="absolute inset-y-0 rounded-full bg-chart-1"
          style={{ left: `${left.toFixed(1)}%`, width: `${width.toFixed(1)}%` }}
        />
      </div>
      <div className="flex font-bold text-muted-strong text-sm tabular-nums">
        <span>{formatCurrency(low)}</span>
        <span className="ml-auto">{formatCurrency(high)}</span>
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
  const allTimeLow = allPremiums.length ? Math.min(...allPremiums) : 0;

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

      <ReportSection
        caption={`${category} · last ${historyRows.length} exercises`}
        title="Bidding history"
      >
        <ReportTable
          columns={[
            { label: "Exercise" },
            { align: "end", label: "Premium" },
            { align: "end", label: "Change" },
            { align: "end", label: "Quota" },
            { align: "end", label: "Bids" },
            { label: "Success rate", width: "240px" },
          ]}
        >
          {historyRows.map(({ exercise, ratio }) => {
            const rate = successRate(
              exercise.bidsSuccess,
              exercise.bidsReceived,
            );

            return (
              <ReportRow key={`${exercise.month}:${exercise.biddingNo}`}>
                <ReportCell className="font-semibold text-base">
                  {formatMonth(exercise.month, "short")} ·{" "}
                  {biddingOrdinal(exercise.biddingNo)}
                </ReportCell>
                <ReportCell align="end" className="font-extrabold text-lg">
                  {formatCurrency(exercise.premium)}
                </ReportCell>
                <ReportCell align="end">
                  <PremiumDelta ratio={ratio} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  <Count value={exercise.quota} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  <Count value={exercise.bidsReceived} />
                </ReportCell>
                <ReportCell>
                  <SuccessRateCell rate={rate} />
                </ReportCell>
              </ReportRow>
            );
          })}
        </ReportTable>
      </ReportSection>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <ReportSection title="Premium range">
          <div className="flex flex-col gap-6">
            <PremiumRangeBar
              high={yearHigh}
              label={`${year} year to date`}
              low={yearLow}
              scale={allTimeHigh}
            />
            <PremiumRangeBar
              high={allTimeHigh}
              label="All-time"
              low={allTimeLow}
              scale={allTimeHigh}
            />
          </div>
        </ReportSection>

        <ReportNote title="How to read this">
          <Typography.Paragraph>
            A premium is the price of the last successful bid in an exercise, so
            it is set by demand rather than announced in advance. A decrease is
            shown in green.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Renewing an existing COE uses the PQP instead — the three-month
            moving average of premiums in that category.
          </Typography.Paragraph>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/coe/pqp"
          >
            PQP rates in full →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/coe/results"
          >
            Bidding results by exercise →
          </Link>
        </ReportNote>
      </div>
    </>
  );
}
