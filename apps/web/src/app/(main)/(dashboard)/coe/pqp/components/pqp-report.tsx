import { cn, Skeleton, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  formatMonth,
  summarisePQP,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  compareCaption,
  monthsCaption,
  type PQPCategoryRate,
  ratesCaption,
  trendCaption,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-captions";
import {
  PQPChart,
  type PQPSeries,
  type PQPTrendPoint,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-chart";
import {
  PQPPremiumBars,
  type PQPPremiumPoint,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-premium-bars";
import {
  type PQPRateRow,
  PQPRatesTable,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-rates-table";
import {
  categoryName,
  loadPqpData,
  loadPqpView,
  type PQPPageProps,
  SelectedLabel,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-view";
import { RenewalCalculator } from "@web/app/(main)/(dashboard)/coe/pqp/components/renewal-calculator";
import {
  PQP_CATEGORY_KEYS,
  type PQPCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import {
  formatChartMonth,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { Suspense } from "react";

/**
 * What renewing costs against bidding, beyond the price. Authored copy — none
 * of it is derived from the data, and all of it decides the question the page
 * is actually asked.
 */
const RENEWAL_TRADEOFFS: { label: string; note: string }[] = [
  {
    label: "Price certainty",
    note: "The PQP is published before the month starts; a bid is settled only when the exercise closes.",
  },
  {
    label: "PARF rebate",
    note: "Lost on renewal. A car that has had its COE renewed carries no PARF value at deregistration.",
  },
  {
    label: "Term",
    note: "Five or ten years. A five-year renewal is final — the car must be deregistered at the end of it.",
  },
  {
    label: "Timing",
    note: "Renew any time before expiry, or up to a month after with a late fee. Renewing before the expiry month forfeits the unused months.",
  },
];

/** The two category columns of the month-by-month list. */
const MONTH_CELL = "w-36 shrink-0 text-right max-md:w-24";

const SECTION = "flex scroll-mt-4 flex-col gap-4";

/** Each category's latest published rate beside its latest premium. */
async function loadCategoryRates(): Promise<
  (PQPCategoryRate & { key: PQPCategoryKey })[]
> {
  const { ascending, latestPremium } = await loadPqpData();
  return PQP_CATEGORY_KEYS.map((key) => ({
    key,
    premium: latestPremium(key),
    rate: ascending.at(-1)?.[categoryName(key)] ?? 0,
  }));
}

/**
 * The renew-or-deregister calculator, on the cached rates. It reads today's
 * date as it renders, which is request-time data, hence the boundary.
 */
export async function PQPCalculator() {
  const { trendData } = await loadPqpData();
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-md" />}>
      <RenewalCalculator rates={trendData} />
    </Suspense>
  );
}

/** Figure 1: every category's PQP by month, at the selected term. */
export function PQPTrend({ searchParams }: PQPPageProps) {
  return (
    <section className={SECTION} id="pqp-trend">
      <SectionHead
        caption={
          <Suspense fallback=" ">
            <TrendCaption searchParams={searchParams} />
          </Suspense>
        }
        eyebrow="Figure 1 · Trend"
        title={
          <>
            PQP by month,{" "}
            <SelectedLabel part="term" searchParams={searchParams} /> renewal
          </>
        }
      />
      <SectionErrorBoundary title="PQP trend unavailable">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-md" />}>
          <TrendChart searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
      <SourceNote>
        Source: LTA via DataMall · PQP published for each month,{" "}
        <SelectedLabel part="term" searchParams={searchParams} /> renewal.
        Y-axis does not start at zero. Hover or tap for values.
      </SourceNote>
    </section>
  );
}

async function TrendCaption({ searchParams }: PQPPageProps) {
  const { category, rates } = await loadPqpView(searchParams);
  return trendCaption(`Category ${category}`, rates) ?? null;
}

async function TrendChart({ searchParams }: PQPPageProps) {
  const { ascending, category, factor } = await loadPqpView(searchParams);

  const series: PQPSeries[] = PQP_CATEGORY_KEYS.map((key) => ({
    key: categoryName(key),
    label: `Category ${key}`,
  }));
  const data: PQPTrendPoint[] = ascending.map((point, index) => ({
    label: formatChartMonth(point.month),
    title: formatMonth(point.month),
    year:
      index === 0 || point.month.endsWith("-01") ? point.month.slice(0, 4) : "",
    ...Object.fromEntries(
      PQP_CATEGORY_KEYS.map((key) => [
        categoryName(key),
        point[categoryName(key)] * factor,
      ]),
    ),
  }));
  const ticks = axisTicks(
    data.flatMap((point) =>
      PQP_CATEGORY_KEYS.map((key) => Number(point[categoryName(key)])),
    ),
    { zero: false },
  );

  return (
    <PQPChart
      data={data}
      selected={categoryName(category)}
      series={series}
      ticks={ticks}
    />
  );
}

/** Figure 2: the published rate for every category, selectable by row. */
export function PQPRates({ searchParams }: PQPPageProps) {
  return (
    <section className={SECTION} id="pqp-rates">
      <SectionHead
        caption={<RatesCaption />}
        eyebrow="Figure 2 · Rates by category"
        title={<RatesTitle />}
      />
      <SectionErrorBoundary title="PQP rates unavailable">
        <Suspense fallback={<Skeleton className="h-40 w-full rounded-md" />}>
          <RatesTable searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
      <RatesSummary />
      <SourceNote>
        Source: LTA via DataMall · 5-year cost is half the PQP. Gap is the
        latest closing premium minus the PQP, as a share of the premium. PQP is
        listed for Categories A and B only. Category E has no PQP of its own:
        per LTA, a Category E COE is renewed at the PQP of the vehicle's own
        category, A to D. Select a row to switch the headline and chart.
      </SourceNote>
    </section>
  );
}

async function RatesTitle() {
  const { latestMonth } = await loadPqpData();
  return `${latestMonth ? `${formatMonth(latestMonth)} ` : ""}published rates`;
}

async function RatesCaption() {
  return ratesCaption(await loadCategoryRates()) ?? null;
}

/** The 10-year and 5-year cost of each category, quoted from the data. */
async function RatesSummary() {
  const { ascending } = await loadPqpData();
  const summary = summarisePQP(ascending);
  return summary ? (
    <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
      {summary}
    </Typography.Paragraph>
  ) : null;
}

async function RatesTable({ searchParams }: PQPPageProps) {
  const [{ ascending }, categoryRates] = await Promise.all([
    loadPqpView(searchParams),
    loadCategoryRates(),
  ]);
  const previousMonth = ascending.at(-2)?.month;
  const rows: PQPRateRow[] = categoryRates.map(({ key, premium, rate }) => {
    const priorRate = ascending.at(-2)?.[categoryName(key)] ?? 0;
    return {
      changeRatio: priorRate > 0 ? (rate - priorRate) / priorRate : null,
      description: CATEGORY_DESCRIPTIONS[toCategory(key)],
      // How far the market sits above the renewal rate.
      gapRatio: premium > 0 ? (premium - rate) / premium : null,
      key,
      latestPremium: premium,
      tenYear: rate,
    };
  });

  return (
    <PQPRatesTable
      categories={PQP_CATEGORY_KEYS}
      previousMonthLabel={
        previousMonth ? formatMonthName(previousMonth) : "last month"
      }
      rows={rows}
    />
  );
}

/** Figure 3: each category's PQP against its latest closing premium. */
export function PQPCompare({ searchParams }: PQPPageProps) {
  return (
    <section className={SECTION} id="pqp-cmp">
      <SectionHead
        caption={<CompareCaption />}
        eyebrow="Figure 3 · Renewing or bidding"
        title="PQP against the closing premium"
      />
      <SectionErrorBoundary title="Comparison unavailable">
        <Suspense fallback={<Skeleton className="h-56 w-full rounded-md" />}>
          <CompareBars searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
      <SourceNote>
        Source: LTA via DataMall · Both at the full 10-year value. Bars start at
        $0 on a shared scale.
        <CompareExercise />
      </SourceNote>
    </section>
  );
}

async function CompareCaption() {
  return compareCaption(await loadCategoryRates()) ?? null;
}

async function CompareExercise() {
  const { latestExercise } = await loadPqpData();
  return latestExercise
    ? ` The latest premium is from the ${biddingOrdinal(latestExercise.biddingNo)} bidding exercise of ${formatMonth(latestExercise.month)}.`
    : null;
}

async function CompareBars({ searchParams }: PQPPageProps) {
  const [{ category }, categoryRates] = await Promise.all([
    loadPqpView(searchParams),
    loadCategoryRates(),
  ]);
  const data: PQPPremiumPoint[] = categoryRates.map(
    ({ key, premium, rate }) => ({
      category: `Cat ${key}`,
      pqp: rate,
      premium,
    }),
  );

  return (
    <PQPPremiumBars
      data={data}
      selected={`Cat ${category}`}
      ticks={axisTicks(
        data.flatMap((point) => [point.pqp, point.premium]),
        { zero: true },
      )}
    />
  );
}

/** Figure 4: every published month, most recent first, at the selected term. */
export function PQPMonths({ searchParams }: PQPPageProps) {
  return (
    <section className={SECTION} id="pqp-months">
      <SectionHead
        caption={
          <Suspense fallback=" ">
            <MonthsCaption searchParams={searchParams} />
          </Suspense>
        }
        eyebrow="Figure 4 · Month by month"
        title="Published PQP per category"
      />
      <SectionErrorBoundary title="Monthly rates unavailable">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-md" />}>
          <MonthRows searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
      <SourceNote>
        Source: LTA via DataMall ·{" "}
        <SelectedLabel part="term" searchParams={searchParams} /> renewal, most
        recent first; change against the previous month.
        <OldestMonthNote />
      </SourceNote>
    </section>
  );
}

async function MonthsCaption({ searchParams }: PQPPageProps) {
  const { category, rates } = await loadPqpView(searchParams);
  return monthsCaption(`Category ${category}`, rates) ?? null;
}

async function OldestMonthNote() {
  const { tableRows } = await loadPqpData();
  const oldestMonth = tableRows.at(-1)?.month;
  return oldestMonth
    ? ` ${formatMonth(oldestMonth)} is the first month shown, so it has no change.`
    : null;
}

async function MonthRows({ searchParams }: PQPPageProps) {
  const { factor, latestMonth, tableRows } = await loadPqpView(searchParams);

  return (
    <div className="flex max-w-3xl flex-col">
      <div className="flex items-end gap-3.5 border-border border-b px-3 pb-2.5 font-semibold text-muted text-xs max-md:px-1.5">
        <span className="min-w-0 flex-1">Month</span>
        {PQP_CATEGORY_KEYS.map((key) => (
          <span className={MONTH_CELL} key={key}>
            Cat {key}
          </span>
        ))}
      </div>
      <ol className="flex flex-col">
        {tableRows.map((row, index) => {
          const earlier = tableRows[index + 1];
          return (
            <li
              className={cn(
                "flex items-center gap-3.5 border-separator border-b px-3 py-2.5 max-md:px-1.5",
                row.month === latestMonth && "bg-surface-secondary",
              )}
              key={row.key}
            >
              <span className="min-w-0 flex-1 font-semibold text-sm">
                {formatMonth(row.month)}
              </span>
              {PQP_CATEGORY_KEYS.map((key) => {
                const name = categoryName(key);
                const rate = row[name];
                const earlierRate = earlier?.[name] ?? 0;
                return (
                  <span
                    className={cn(MONTH_CELL, "flex flex-col items-end gap-px")}
                    key={key}
                  >
                    <span className="font-semibold text-base tabular-nums">
                      {rate > 0 ? formatCurrency(rate * factor) : "—"}
                    </span>
                    <span className="text-muted text-xs tabular-nums">
                      {earlier && earlierRate > 0 && rate > 0 ? (
                        <CostTrendChip
                          changeRatio={(rate - earlierRate) / earlierRate}
                        />
                      ) : (
                        "—"
                      )}
                    </span>
                  </span>
                );
              })}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** What renewing trades away against bidding, beyond the price. */
export function PQPTradeoffs() {
  return (
    <section className={SECTION} id="pqp-notes">
      <SectionHead
        eyebrow="Renewing versus bidding"
        title="What the price does not tell you"
      />
      <dl className="flex flex-col border-border border-t">
        {RENEWAL_TRADEOFFS.map(({ label, note }) => (
          <div
            className="flex items-baseline gap-5 border-separator border-b py-3 max-md:flex-col max-md:gap-1"
            key={label}
          >
            <dt className="w-44 shrink-0 font-semibold text-sm">{label}</dt>
            <dd className="text-muted-strong text-sm">{note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
