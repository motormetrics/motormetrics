import { Skeleton } from "@heroui/react";
import { TableDisclosure } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/disclosure";
import { formatMonth } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  PQPChart,
  type PQPSeries,
  type PQPTrendPoint,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-chart";
import {
  CategoryTabs,
  TermTabs,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-filters";
import {
  type PQPMonthRow,
  PQPMonthsTable,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-months-table";
import {
  categoryName,
  loadPqpData,
  loadPqpView,
  type PQPPageProps,
  SelectedLabel,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-view";
import { RenewalCalculator } from "@web/app/(main)/(dashboard)/coe/pqp/components/renewal-calculator";
import { PQP_CATEGORY_KEYS } from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { FigureCard } from "@web/components/shared/figure-card";
import { changeRatio } from "@web/utils/change-ratio";
import { formatChartMonth } from "@web/utils/dates/format-month";
import { Suspense } from "react";

/**
 * The renew-or-deregister calculator, on the cached rates. It reads today's
 * date as it renders, which is request-time data, hence the boundary.
 */
export async function PQPCalculator() {
  const { trendData } = await loadPqpData();
  return (
    <FigureCard
      description="Estimates to compare, not a recommendation or financial advice"
      title={<span id="renewal-calculator">Renew or deregister?</span>}
    >
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <RenewalCalculator rates={trendData} />
      </Suspense>
    </FigureCard>
  );
}

/**
 * Every category's PQP by month, then every published month as a table, at
 * the selected term. One card, because the switches in its header change
 * both; the table is closed by default and stays in the markup.
 */
export function PQPTrend({ searchParams }: PQPPageProps) {
  return (
    <SectionErrorBoundary title="PQP trend unavailable">
      <FigureCard
        description={
          <>
            <SelectedLabel part="term" searchParams={searchParams} /> renewal
            cost, as published each month
          </>
        }
        title="PQP by month"
        trailing={
          <>
            <Suspense fallback={<Skeleton className="h-10 w-36" />}>
              <CategoryTabs categories={PQP_CATEGORY_KEYS} />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-10 w-72" />}>
              <TermTabs />
            </Suspense>
          </>
        }
      >
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <TrendChart searchParams={searchParams} />
        </Suspense>
        <TableDisclosure title="Every published month">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <MonthRows searchParams={searchParams} />
          </Suspense>
        </TableDisclosure>
      </FigureCard>
    </SectionErrorBoundary>
  );
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

/** Every published month, most recent first, with its change on the month before. */
async function MonthRows({ searchParams }: PQPPageProps) {
  const { factor, tableRows } = await loadPqpView(searchParams);

  const rows: PQPMonthRow[] = tableRows.map((row, index) => {
    const earlier = tableRows[index + 1];
    return {
      key: row.key,
      month: formatMonth(row.month),
      rates: Object.fromEntries(
        PQP_CATEGORY_KEYS.flatMap((key) => {
          const name = categoryName(key);
          const rate = row[name];
          if (!(rate > 0)) {
            return [];
          }
          const earlierRate = earlier?.[name] ?? 0;
          return [
            [
              key,
              {
                change:
                  earlierRate > 0 ? changeRatio(rate, earlierRate) * 100 : null,
                rate: rate * factor,
              },
            ],
          ];
        }),
      ),
    };
  });

  return <PQPMonthsTable categories={PQP_CATEGORY_KEYS} rows={rows} />;
}
