import { cn, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  formatMonth,
  groupByExercise,
  summarisePQP,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  PQPChart,
  type PQPSeries,
  type PQPTrendPoint,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-chart";
import { PQPHeadline } from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-headline";
import {
  PQPPremiumBars,
  type PQPPremiumPoint,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-premium-bars";
import {
  type PQPRateRow,
  PQPRatesTable,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-rates-table";
import { RenewalComparison } from "@web/app/(main)/(dashboard)/coe/pqp/components/renewal-comparison";
import { UnreleasedFeature } from "@web/app/(main)/(dashboard)/coe/pqp/components/unreleased-feature";
import {
  loadSearchParams,
  PQP_CATEGORY_KEYS,
  type PQPCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import {
  Hairline,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import { getCoeResults, getPQPOverview } from "@web/queries/coe";
import type { Pqp } from "@web/types/coe";
import {
  formatChartMonth,
  formatMonthName,
} from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";

/** `A` → `Category A`, the key the query and the types use. */
const categoryName = (key: PQPCategoryKey) =>
  toCategory(key) as keyof Pqp.Rates;

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
    note: "Renew any time in the month before expiry, or up to a month after, with a late fee.",
  },
];

/** The two category columns of the month-by-month list. */
const MONTH_CELL = "w-36 shrink-0 text-right max-md:w-24";

export async function PQPReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category, term }, overview, coeResults] = await Promise.all([
    loadSearchParams(searchParams),
    getPQPOverview(),
    getCoeResults(),
  ]);
  // The overview's latest premium is from the newest exercise, which the
  // headline names.
  const latestExercise = groupByExercise(coeResults).at(-1);
  const { comparison, latestMonth, tableRows, trendData } = overview;

  if (!latestMonth || tableRows.length === 0) {
    return <Typography.Paragraph>No PQP data available.</Typography.Paragraph>;
  }

  // A ten-year renewal costs the full PQP; a five-year renewal costs half. The
  // rate itself is what LTA publishes, so the term scales it rather than
  // selecting a different figure.
  const termFactor = term === "5" ? 0.5 : 1;

  const formattedMonth = formatMonth(latestMonth);
  const selected = categoryName(category);
  const comparisonByCategory = new Map(
    comparison.map((row) => [row.category, row]),
  );
  const headlineComparison = comparisonByCategory.get(selected);

  // The query returns the months newest first; the chart reads left to right.
  const ascending = [...trendData].sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  const series: PQPSeries[] = PQP_CATEGORY_KEYS.map((key) => ({
    key: categoryName(key),
    label: `Category ${key}`,
  }));

  const chartData: PQPTrendPoint[] = ascending.map((point, index) => ({
    label: formatChartMonth(point.month),
    title: formatMonth(point.month),
    year:
      index === 0 || point.month.endsWith("-01") ? point.month.slice(0, 4) : "",
    ...Object.fromEntries(
      PQP_CATEGORY_KEYS.map((key) => [
        categoryName(key),
        point[categoryName(key)] * termFactor,
      ]),
    ),
  }));
  const chartTicks = axisTicks(
    chartData.flatMap((point) =>
      PQP_CATEGORY_KEYS.map((key) => Number(point[categoryName(key)])),
    ),
    { zero: false },
  );
  const chartStep =
    chartTicks.length > 1 ? chartTicks[1] - chartTicks[0] : undefined;
  const firstMonth = ascending[0]?.month;
  const oldestMonth = tableRows.at(-1)?.month;
  const previousMonth = ascending.at(-2)?.month;
  const summary = summarisePQP(ascending);

  const rateRows: PQPRateRow[] = PQP_CATEGORY_KEYS.map((key) => {
    const name = categoryName(key);
    const rate = ascending.at(-1)?.[name] ?? 0;
    const priorRate = ascending.at(-2)?.[name] ?? 0;
    const premium = comparisonByCategory.get(name)?.latestPremium ?? 0;

    return {
      changeRatio: priorRate > 0 ? (rate - priorRate) / priorRate : null,
      description: CATEGORY_DESCRIPTIONS[toCategory(key)],
      // The comp's definition: how far the market sits above the renewal rate.
      gapRatio: premium > 0 ? (premium - rate) / premium : null,
      key,
      latestPremium: premium,
      tenYear: rate,
    };
  });

  const premiumBars: PQPPremiumPoint[] = PQP_CATEGORY_KEYS.map((key) => {
    const name = categoryName(key);
    return {
      category: `Cat ${key}`,
      pqp: ascending.at(-1)?.[name] ?? 0,
      premium: comparisonByCategory.get(name)?.latestPremium ?? 0,
    };
  });
  const premiumTicks = axisTicks(
    premiumBars.flatMap((point) => [point.pqp, point.premium]),
    { zero: true },
  );

  return (
    <>
      <PQPHeadline
        category={category}
        latestExercise={latestExercise}
        latestPremium={headlineComparison?.latestPremium ?? 0}
        rates={ascending.map((point) => ({
          month: point.month,
          rate: point[selected],
        }))}
        term={term}
      />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`${firstMonth ? `${formatMonth(firstMonth)} to ` : ""}${formattedMonth} · ${term}-year renewal`}
          eyebrow="Trend"
          title="PQP by month"
        />
        <PQPChart
          data={chartData}
          selected={selected}
          series={series}
          ticks={chartTicks}
        />
        <SourceNote>
          Source: LTA via DataMall · PQP published for each month, {term}-year
          renewal · Y-axis does not start at zero
          {chartStep ? `; gridlines every ${formatCurrency(chartStep)}.` : "."}
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption="Select a row to switch the headline and chart"
          eyebrow="Rates by category"
          title={`${formattedMonth} published rates`}
        />
        <PQPRatesTable
          categories={PQP_CATEGORY_KEYS}
          previousMonthLabel={
            previousMonth ? formatMonthName(previousMonth) : "last month"
          }
          rows={rateRows}
        />
        {summary ? (
          <Typography.Paragraph
            className="tabular-nums"
            color="muted"
            size="sm"
          >
            {summary}
          </Typography.Paragraph>
        ) : null}
        <SourceNote>
          5-year cost is half the PQP. Gap is the latest closing premium minus
          the PQP, as a share of the premium. PQP is listed for Categories A and
          B only; there is no PQP for Category E.
        </SourceNote>
      </section>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <section className="flex min-w-0 flex-col gap-4 lg:col-span-7">
          <SectionHead
            caption={`${formattedMonth} PQP and the latest premium · both at the full 10-year value`}
            eyebrow="Renewing or bidding"
            title="PQP against the closing premium"
          />
          <PQPPremiumBars
            data={premiumBars}
            selected={`Cat ${category}`}
            ticks={premiumTicks}
          />
          <SourceNote>
            Bars start at $0 on a shared scale.
            {latestExercise
              ? ` The latest premium is from the ${biddingOrdinal(latestExercise.biddingNo)} bidding exercise of ${formatMonth(latestExercise.month)}.`
              : null}
          </SourceNote>
        </section>

        <section className="flex min-w-0 flex-col gap-4 lg:col-span-5">
          <SectionHead
            eyebrow="Reading the numbers"
            title="How the PQP is set"
          />
          <Typography.Paragraph className="text-muted-strong">
            LTA averages the closing premiums in that category over the last
            three months, across both exercises, and publishes it as the rate
            for the coming month. It therefore lags the market rather than
            leading it.
          </Typography.Paragraph>
          <Typography.Paragraph className="text-muted-strong">
            A 5-year renewal costs half the PQP, but the car cannot be renewed
            again after that term.
          </Typography.Paragraph>
          <div className="flex flex-col items-start gap-2">
            <SectionLink className="ml-0" href="/coe/premiums">
              Premium trends
            </SectionLink>
            <SectionLink className="ml-0" href="/cars/parf">
              PARF rebate calculator
            </SectionLink>
          </div>
        </section>
      </div>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`${term}-year renewal · most recent first · change against the previous month`}
          eyebrow="Month by month"
          title="Published PQP per category"
        />
        <div className="flex flex-col">
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
                        className={cn(
                          MONTH_CELL,
                          "flex flex-col items-end gap-px",
                        )}
                        key={key}
                      >
                        <span className="font-semibold text-base tabular-nums">
                          {rate > 0 ? formatCurrency(rate * termFactor) : "—"}
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
        <SourceNote>
          PQP as published for each month.
          {oldestMonth
            ? ` ${formatMonth(oldestMonth)} is the first month shown, so it has no change.`
            : null}
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
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

      <UnreleasedFeature>
        <RenewalComparison
          category={selected}
          summaries={overview.categorySummaries}
          term={term}
        />
      </UnreleasedFeature>
    </>
  );
}
