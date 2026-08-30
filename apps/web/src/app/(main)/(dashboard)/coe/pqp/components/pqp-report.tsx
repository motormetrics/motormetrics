import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils";
import { formatMonth } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  PQPChart,
  type PQPSeries,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-chart";
import {
  PQPComparisonChart,
  type PQPComparisonPoint,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-comparison-chart";
import {
  CategoryTabs,
  TermTabs,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-filters";
import { RenewalComparison } from "@web/app/(main)/(dashboard)/coe/pqp/components/renewal-comparison";
import {
  loadSearchParams,
  PQP_CATEGORY_KEYS,
  type PQPCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { CostTrendChip } from "@web/app/(main)/(dashboard)/components/cost-trend-chip";
import {
  ReportFilterBar,
  ReportHeadline,
  ReportNote,
  ReportSection,
  ReportStat,
} from "@web/components/shared/report";
import {
  DeltaText,
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";
import { UnreleasedFeature } from "@web/components/unreleased-feature";
import { getPQPOverview } from "@web/queries/coe";
import type { Pqp } from "@web/types/coe";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

/** `A` → `Category A`, the key the query and the types use. */
const categoryName = (key: PQPCategoryKey) =>
  `Category ${key}` as keyof Pqp.Rates;

/** What each renewal category covers. */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  A: "Cars up to 1,600cc and 130bhp",
  B: "Cars above 1,600cc or 130bhp",
  C: "Goods vehicles and buses",
  D: "Motorcycles",
};

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

function changePercent(current: number, previous: number): number | null {
  return previous > 0 ? ((current - previous) / previous) * 100 : null;
}

export async function PQPReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, term } = await loadSearchParams(searchParams);
  const overview = await getPQPOverview();
  const { comparison, latestMonth, tableRows, trendData } = overview;

  if (!latestMonth || tableRows.length === 0) {
    return <Typography.Paragraph>No PQP data available.</Typography.Paragraph>;
  }

  // A ten-year renewal costs the full PQP; a five-year renewal costs half. The
  // rate itself is what LTA publishes, so the term scales it rather than
  // selecting a different figure.
  const termFactor = term === "5" ? 0.5 : 1;
  const otherTerm = term === "5" ? "10" : "5";
  const otherFactor = term === "5" ? 1 : 0.5;

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
  const latestRate = ascending.at(-1)?.[selected] ?? 0;
  const priorRate = ascending.at(-2)?.[selected] ?? 0;
  const threeMonthsAgoRate = ascending.at(-4)?.[selected] ?? 0;
  const headlineChange = changePercent(latestRate, priorRate);

  const series: PQPSeries[] = PQP_CATEGORY_KEYS.map((key, index) => ({
    color: `var(--chart-${index + 1})`,
    key: categoryName(key),
    label: `Category ${key}`,
  }));

  const chartData = ascending.map((point) => ({
    label: formatMonth(point.month, "short"),
    ...Object.fromEntries(
      PQP_CATEGORY_KEYS.map((key) => [
        categoryName(key),
        point[categoryName(key)] * termFactor,
      ]),
    ),
  }));

  const comparisonData: PQPComparisonPoint[] = PQP_CATEGORY_KEYS.map((key) => {
    const name = categoryName(key);

    return {
      category: `Cat ${key}`,
      latestPremium: comparisonByCategory.get(name)?.latestPremium ?? 0,
      pqpRate: ascending.at(-1)?.[name] ?? 0,
    };
  });

  return (
    <>
      <ReportFilterBar
        label="Category"
        trailing={<TermTabs />}
        trailingLabel="Renewal"
      >
        <CategoryTabs categories={PQP_CATEGORY_KEYS} />
      </ReportFilterBar>

      <ReportHeadline
        delta={
          headlineChange === null ? undefined : (
            <CostTrendChip changeRatio={headlineChange / 100} />
          )
        }
        label={`Category ${category} · ${CATEGORY_DESCRIPTIONS[category]}`}
        stats={
          <>
            <ReportStat
              label="Previous month"
              note="published rate"
              value={formatCurrency(priorRate * termFactor)}
            />
            <ReportStat
              label="Latest premium"
              note="most recent exercise"
              value={formatCurrency(headlineComparison?.latestPremium ?? 0)}
            />
            <ReportStat
              label={`${otherTerm}-year renewal`}
              note={otherTerm === "10" ? "the full PQP" : "half the PQP"}
              value={formatCurrency(latestRate * otherFactor)}
            />
            <ReportStat
              label="Three months ago"
              note="published rate"
              value={formatCurrency(threeMonthsAgoRate * termFactor)}
            />
          </>
        }
        sub={`${term}-year renewal · three-month average of premiums to ${formattedMonth}`}
        value={formatCurrency(latestRate * termFactor)}
      />

      <div className="flex flex-col gap-3.5">
        <PQPChart data={chartData} series={series} />
        <Typography.Paragraph color="muted" size="sm">
          Rates are quoted for a {term}-year renewal. The comps draw the closing
          premium alongside the rate; that series is not in this query yet.
        </Typography.Paragraph>
      </div>

      <ReportSection
        caption={`${formattedMonth} · both figures at the full ten-year value`}
        title="PQP against the closing premium"
      >
        <PQPComparisonChart data={comparisonData} />
        <Typography.Paragraph color="muted" size="sm">
          A bar above the dashed line means the market is bidding above the
          renewal rate; a bar below it means renewing is the dearer of the two.
        </Typography.Paragraph>
      </ReportSection>

      <ReportSection
        caption={`${formattedMonth} · published rates for a ${term}-year renewal`}
        title="Rates by category"
      >
        <ReportTable
          columns={[
            { label: "Cat", width: "74px" },
            { label: "Description" },
            { align: "end", label: `${term}-year cost` },
            { align: "end", label: `${otherTerm}-year cost` },
            { align: "end", label: "Latest premium" },
            { align: "end", label: "Gap to premium" },
            { align: "end", label: "Vs last month", width: "130px" },
          ]}
        >
          {PQP_CATEGORY_KEYS.map((key) => {
            const name = categoryName(key);
            const rate = ascending.at(-1)?.[name] ?? 0;
            const priorCategoryRate = ascending.at(-2)?.[name] ?? 0;
            const monthChange = changePercent(rate, priorCategoryRate);
            const row = comparisonByCategory.get(name);
            const premium = row?.latestPremium ?? 0;
            const gap = changePercent(rate, premium);

            return (
              <ReportRow isActive={key === category} key={key}>
                <ReportCell>
                  <span
                    className="inline-flex size-10 items-center justify-center rounded-full font-extrabold text-base"
                    style={{
                      backgroundColor:
                        key === category
                          ? "var(--accent)"
                          : "var(--surface-secondary)",
                      color:
                        key === category
                          ? "var(--accent-foreground)"
                          : "var(--accent-strong)",
                    }}
                  >
                    {key}
                  </span>
                </ReportCell>
                <ReportCell className="font-semibold text-base">
                  {CATEGORY_DESCRIPTIONS[key]}
                </ReportCell>
                <ReportCell align="end" className="font-extrabold text-lg">
                  {formatCurrency(rate * termFactor)}
                </ReportCell>
                <ReportCell
                  align="end"
                  className="font-bold text-accent-strong text-base"
                >
                  {formatCurrency(rate * otherFactor)}
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  {formatCurrency(premium)}
                </ReportCell>
                <ReportCell align="end">
                  {gap === null ? (
                    <span className="font-semibold text-muted text-sm">—</span>
                  ) : (
                    // A rate above the premium is bad news for a renewal, so
                    // the sentiment is inverted against the raw sign.
                    <DeltaText value={-gap} />
                  )}
                </ReportCell>
                <ReportCell align="end">
                  {monthChange === null ? (
                    <span className="font-semibold text-muted text-sm">—</span>
                  ) : (
                    <DeltaText value={-monthChange} />
                  )}
                </ReportCell>
              </ReportRow>
            );
          })}
        </ReportTable>
      </ReportSection>

      <ReportSection
        caption={`Published PQP per category · ${term}-year renewal`}
        title="Month by month"
      >
        <ReportTable
          columns={[
            { label: "Month" },
            ...PQP_CATEGORY_KEYS.map((key) => ({
              align: "end" as const,
              label: `Cat ${key}`,
            })),
          ]}
        >
          {tableRows.map((row, index) => {
            const earlier = tableRows[index + 1];

            return (
              <ReportRow isActive={row.month === latestMonth} key={row.key}>
                <ReportCell className="font-bold text-base">
                  {formatMonth(row.month)}
                </ReportCell>
                {PQP_CATEGORY_KEYS.map((key) => {
                  const name = categoryName(key);
                  const rate = row[name];
                  const monthChange = earlier
                    ? changePercent(rate, earlier[name])
                    : null;

                  return (
                    <ReportCell align="end" key={key}>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-extrabold text-base">
                          {rate > 0 ? formatCurrency(rate * termFactor) : "—"}
                        </span>
                        {monthChange === null ? null : (
                          <span className="text-xs">
                            <DeltaText value={-monthChange} />
                          </span>
                        )}
                      </div>
                    </ReportCell>
                  );
                })}
              </ReportRow>
            );
          })}
        </ReportTable>
      </ReportSection>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <ReportSection
          caption="What the price does not tell you"
          title="Renewing versus bidding"
        >
          <div className="flex flex-col">
            {RENEWAL_TRADEOFFS.map(({ label, note }) => (
              <div
                className="flex flex-wrap items-baseline gap-5 border-border border-b py-4"
                key={label}
              >
                <span className="w-[190px] shrink-0 font-bold text-base">
                  {label}
                </span>
                <span className="font-medium text-base text-muted-strong">
                  {note}
                </span>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportNote title="How the PQP is set">
          <Typography.Paragraph>
            LTA averages the closing premiums in that category over the last
            three months, across both exercises, and publishes it as the rate
            for the coming month. It therefore lags the market rather than
            leading it.
          </Typography.Paragraph>
          <Typography.Paragraph>
            A five-year renewal costs half the PQP, but the car cannot be
            renewed again after that term.
          </Typography.Paragraph>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/coe/premiums"
          >
            Premium trends →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/parf"
          >
            PARF rebate calculator →
          </Link>
        </ReportNote>
      </div>

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
