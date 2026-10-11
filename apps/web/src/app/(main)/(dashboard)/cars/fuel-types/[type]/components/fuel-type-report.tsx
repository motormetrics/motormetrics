import { Skeleton, Typography } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { formatOrdinal } from "@motormetrics/utils/format-ordinal";
import { slugify } from "@motormetrics/utils/slugify";
import { PeriodTabs } from "@web/app/(main)/(dashboard)/cars/components/category/period-tabs";
import { TypeChart } from "@web/app/(main)/(dashboard)/cars/components/category/type-chart";
import { typeDetailMeta } from "@web/app/(main)/(dashboard)/cars/components/category/type-detail";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MonthMenu } from "@web/components/shared/month-menu";
import { OverviewPage } from "@web/components/shared/overview";
import { PageHead } from "@web/components/shared/page-head";
import {
  ReportFilterBar,
  ReportHeadline,
  ReportNote,
  ReportSection,
  ReportStat,
} from "@web/components/shared/report";
import {
  Count,
  DeltaText,
  ReportCell,
  ReportRow,
  ReportTable,
  ShareBar,
} from "@web/components/shared/report-table";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { Text } from "@web/components/shared/text";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import { checkFuelTypeIfExist } from "@web/queries/cars";
import {
  getTypeCrossMixInWindow,
  getTypeDistributionInWindow,
  getTypeMakesInWindow,
  getTypeMonthlySeries,
} from "@web/queries/cars/type-detail";
import { percentageChange } from "@web/utils/change-ratio";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

/*
 * A fuel-only copy of `cars/components/category/type-detail.tsx`, so the
 * fuel type page can move to the Hybrid comp while `/cars/vehicle-types/[type]`
 * keeps the shared report unchanged until its own port.
 */

/**
 * The window every aggregate on the page is measured over, anchored on the
 * month the header's month menu picks.
 */
const PERIODS = ["month", "ytd", "12m"] as const;
type Period = (typeof PERIODS)[number];

const PERIOD_LABELS: Record<Period, string> = {
  "12m": "Last 12 months",
  month: "This month",
  ytd: "Year to date",
};

const DEFAULT_PERIOD: Period = "ytd";

const PERIOD_OPTIONS = PERIODS.map((key) => ({
  key,
  label: PERIOD_LABELS[key],
}));

/** How many months the chart and the month-by-month table frame. */
const SERIES_MONTHS = 12;

/** How many makes the by-make table lists before it stops. */
const MAKE_LIMIT = 15;

const loadFuelTypeSearchParams = createLoader({
  month: parseAsString,
  period: parseAsStringLiteral(PERIODS).withDefault(DEFAULT_PERIOD),
});

interface FuelTypeReportProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<SearchParams>;
}

/** Inclusive `YYYY-MM` bounds for a period, anchored on `month`. */
function periodWindow(
  period: Period,
  month: string,
): { from: string; to: string } {
  if (period === "month") {
    return { from: month, to: month };
  }

  if (period === "ytd") {
    return { from: `${month.slice(0, 4)}-01`, to: month };
  }

  return { from: shiftMonth(month, -(SERIES_MONTHS - 1)), to: month };
}

function share(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}

async function resolveFuelType(type: string): Promise<string | undefined> {
  return (await checkFuelTypeIfExist(type))?.fuelType;
}

export function FuelTypeReport({ params, searchParams }: FuelTypeReportProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <Suspense fallback={<FuelTypeHeadSkeleton />}>
        <FuelTypeHead params={params} searchParams={searchParams} />
      </Suspense>

      <SectionErrorBoundary title="Registration data unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <FuelTypeContent params={params} searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </OverviewPage>
  );
}

/** Stands in for `PageHead` while the fuel type resolves. */
function FuelTypeHeadSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-40 sm:ml-auto" />
    </div>
  );
}

async function FuelTypeHead({ params, searchParams }: FuelTypeReportProps) {
  const { type } = await params;
  const value = await resolveFuelType(type);
  const name = value ?? "Fuel type";

  return (
    <PageHead
      controls={
        <Suspense fallback={<Skeleton className="h-8 w-36" />}>
          <FuelTypeMonthPicker searchParams={searchParams} />
        </Suspense>
      }
      eyebrow="Fuel types"
      sub={
        <Suspense fallback={<Skeleton className="h-5 w-72" />}>
          <FuelTypeMonthSub name={name} searchParams={searchParams} />
        </Suspense>
      }
      title={name}
    />
  );
}

/** Names what the page counts, the month it reports and its source. */
async function FuelTypeMonthSub({
  name,
  searchParams,
}: {
  name: string;
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadFuelTypeSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  return (
    <>
      New car registrations recorded as {name}, not the fleet on the road ·{" "}
      <span className="font-semibold text-foreground">
        {formatMonthLabel(month)}
      </span>{" "}
      · Source: LTA via DataMall
    </>
  );
}

async function FuelTypeMonthPicker({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadFuelTypeSearchParams(searchParams);

  const [months, { wasAdjusted }] = await Promise.all([
    fetchMonthsForCars(),
    getMonthOrLatest(parsedMonth, "cars"),
  ]);

  return (
    <MonthMenu
      latestMonth={months[0]}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}

async function FuelTypeContent({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: FuelTypeReportProps) {
  const [{ type }, { month: parsedMonth, period }] = await Promise.all([
    paramsPromise,
    loadFuelTypeSearchParams(searchParamsPromise),
  ]);
  const [{ month }, value] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    resolveFuelType(type),
  ]);
  if (!value) {
    notFound();
  }

  const periodLabel = PERIOD_LABELS[period];

  const { from, to } = periodWindow(period, month);
  const previousFrom = shiftMonth(from, -12);
  const previousTo = shiftMonth(to, -12);

  const [
    series,
    distribution,
    previousDistribution,
    makes,
    previousMakes,
    crossMix,
  ] = await Promise.all([
    getTypeMonthlySeries("fuelType", value, month, SERIES_MONTHS),
    getTypeDistributionInWindow("fuelType", from, to),
    getTypeDistributionInWindow("fuelType", previousFrom, previousTo),
    getTypeMakesInWindow("fuelType", value, from, to),
    getTypeMakesInWindow("fuelType", value, previousFrom, previousTo),
    getTypeCrossMixInWindow("fuelType", value, from, to),
  ]);

  const marketTotal = distribution.reduce((sum, row) => sum + row.count, 0);
  const typeTotal = distribution.find((row) => row.name === value)?.count ?? 0;
  const previousTypeTotal =
    previousDistribution.find((row) => row.name === value)?.count ?? 0;
  const rank = distribution.findIndex((row) => row.name === value) + 1;
  const peerLeader = distribution[0]?.count ?? 0;

  const previousByMake = new Map(
    previousMakes.map((row) => [row.make, row.count]),
  );
  const makeLeader = makes[0]?.count ?? 0;
  const listedMakes = makes.slice(0, MAKE_LIMIT);

  const seriesCounts = series.map(({ count }) => count);
  const bestMonth = seriesCounts.length ? Math.max(...seriesCounts) : 0;

  const chartData = series.map(({ count, month: seriesMonth }) => ({
    count,
    label: formatChartMonth(seriesMonth),
  }));
  const monthRows = [...series].reverse();
  const monthShareLeader = series.length
    ? Math.max(...series.map(({ count, total }) => share(count, total)))
    : 0;

  const isElectric = value === "Electric";

  const { title, description, canonical } = typeDetailMeta(
    "fuel-types",
    type,
    value,
  );
  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}${canonical}`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Fuel types", path: "/cars/fuel-types" },
            { name: value, path: `/cars/fuel-types/${type}` },
          ]),
        }}
      />

      <ReportFilterBar
        label="Period"
        trailing={
          <Typography.Paragraph color="muted" size="sm">
            Figures are new registrations, not the fleet on the road
          </Typography.Paragraph>
        }
      >
        <PeriodTabs defaultKey={DEFAULT_PERIOD} options={PERIOD_OPTIONS} />
      </ReportFilterBar>

      {/* The comp draws a second, wide bento page for Electric. That page is
          deliberately not built — `/cars/electric-vehicles` already tells the
          electric story — so the fuel type page points at it instead. */}
      {isElectric ? (
        <Link
          className="group flex flex-wrap items-baseline gap-3 rounded-xl border border-accent-border bg-accent-soft-2 px-6 py-5"
          href="/cars/electric-vehicles"
        >
          <Typography.Heading
            level={3}
            className="text-accent-strong text-lg group-hover:underline"
          >
            The full electric picture →
          </Typography.Heading>
          <Text.Paragraph size="sm" tone="strong">
            Adoption, charging and the makes leading it, on one page
          </Text.Paragraph>
        </Link>
      ) : null}

      <ReportHeadline
        delta={
          <DeltaChip value={percentageChange(typeTotal, previousTypeTotal)} />
        }
        label={`${value} registrations`}
        stats={
          <>
            <ReportStat
              label="Share of registrations"
              note={periodLabel.toLowerCase()}
              value={`${share(typeTotal, marketTotal).toFixed(1)}%`}
            />
            <ReportStat
              label="Rank"
              note={`of ${distribution.length} fuel types`}
              value={rank > 0 ? `#${rank}` : "—"}
            />
            <ReportStat
              label="Makes"
              note="with registrations"
              value={<Count value={makes.length} />}
            />
            <ReportStat
              label="Best month"
              note={`last ${series.length} months`}
              value={<Count value={bestMonth} />}
            />
          </>
        }
        sub={`${periodLabel} · ${share(typeTotal, marketTotal).toFixed(1)}% of all registrations${rank > 0 ? ` · ${formatOrdinal(rank)} largest of ${distribution.length} fuel types` : ""}`}
        value={<Count value={typeTotal} />}
      />

      <TypeChart data={chartData} />

      <ReportSection
        caption={`${periodLabel}${makes.length > MAKE_LIMIT ? ` · top ${MAKE_LIMIT} of ${makes.length} makes` : ""}`}
        title={`${value} by make`}
      >
        <ReportTable
          columns={[
            { label: "#", width: "60px" },
            { label: "Make" },
            { align: "end", label: "Registrations" },
            { align: "end", label: "Share of type" },
            { label: "", width: "280px" },
            { align: "end", label: "Vs a year earlier", width: "140px" },
          ]}
        >
          {listedMakes.map(({ count, make }, index) => (
            <ReportRow key={make}>
              <ReportCell className="font-bold text-muted text-sm">
                {String(index + 1).padStart(2, "0")}
              </ReportCell>
              <ReportCell className="font-bold text-base">
                <Link
                  className="hover:text-accent-strong"
                  href={`/cars/makes/${slugify(make)}`}
                >
                  {make}
                </Link>
              </ReportCell>
              <ReportCell align="end" className="font-extrabold text-lg">
                <Count value={count} />
              </ReportCell>
              <ReportCell align="end" className="font-semibold text-muted">
                {share(count, typeTotal).toFixed(1)}%
              </ReportCell>
              <ReportCell>
                <ShareBar
                  isLeader={index === 0}
                  share={share(count, makeLeader)}
                />
              </ReportCell>
              <ReportCell align="end">
                <DeltaText
                  value={percentageChange(count, previousByMake.get(make) ?? 0)}
                />
              </ReportCell>
            </ReportRow>
          ))}
        </ReportTable>
      </ReportSection>

      <ReportSection
        caption={`${value} against the whole market`}
        title="Month by month"
      >
        <ReportTable
          columns={[
            { label: "Month" },
            { align: "end", label: value },
            { align: "end", label: "All cars" },
            { align: "end", label: "Share" },
            { label: "", width: "280px" },
            { align: "end", label: "Vs last month", width: "130px" },
          ]}
        >
          {monthRows.map(({ count, month: rowMonth, total }, index) => {
            // `monthRows` runs newest first, so the month before this one is
            // the next entry along.
            const previousCount = monthRows[index + 1]?.count;

            return (
              <ReportRow isActive={rowMonth === month} key={rowMonth}>
                <ReportCell className="font-bold">
                  {formatDateToMonthYear(rowMonth)}
                </ReportCell>
                <ReportCell align="end" className="font-extrabold text-lg">
                  <Count value={count} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  <Count value={total} />
                </ReportCell>
                <ReportCell
                  align="end"
                  className="font-bold text-accent-strong"
                >
                  {share(count, total).toFixed(1)}%
                </ReportCell>
                <ReportCell>
                  <ShareBar
                    share={share(share(count, total), monthShareLeader || 1)}
                  />
                </ReportCell>
                <ReportCell align="end">
                  {previousCount === undefined ? (
                    <span className="font-bold text-muted">—</span>
                  ) : (
                    <DeltaText value={percentageChange(count, previousCount)} />
                  )}
                </ReportCell>
              </ReportRow>
            );
          })}
        </ReportTable>
      </ReportSection>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-10">
          <ReportSection caption={periodLabel} title="Against other fuel types">
            <div className="flex flex-col">
              {distribution.map((peer) => {
                const isSelected = peer.name === value;

                return (
                  <div
                    className="flex items-center gap-5 border-border border-b py-3.5"
                    key={peer.name}
                  >
                    <span
                      className={
                        isSelected
                          ? "w-48 shrink-0 font-extrabold text-accent-strong text-base"
                          : "w-48 shrink-0 font-semibold text-base"
                      }
                    >
                      {peer.name}
                    </span>
                    <div className="flex-1">
                      <ShareBar
                        isLeader={isSelected}
                        share={share(peer.count, peerLeader)}
                      />
                    </div>
                    <span className="w-20 text-right font-extrabold text-base tabular-nums">
                      <Count value={peer.count} />
                    </span>
                  </div>
                );
              })}
            </div>
          </ReportSection>

          <ReportSection
            caption={`${value} · ${periodLabel.toLowerCase()}`}
            title="By vehicle type"
          >
            <ReportTable
              columns={[
                { label: "Vehicle type" },
                { align: "end", label: "Registrations" },
                { align: "end", label: "Share" },
                { label: "", width: "200px" },
              ]}
            >
              {crossMix.map(({ count, name }, index) => (
                <ReportRow key={name}>
                  <ReportCell className="font-semibold">
                    {formatVehicleType(name)}
                  </ReportCell>
                  <ReportCell align="end" className="font-extrabold">
                    <Count value={count} />
                  </ReportCell>
                  <ReportCell align="end" className="font-semibold text-muted">
                    {share(count, typeTotal).toFixed(1)}%
                  </ReportCell>
                  <ReportCell>
                    <ShareBar
                      isLeader={index === 0}
                      share={share(count, crossMix[0]?.count ?? 0)}
                    />
                  </ReportCell>
                </ReportRow>
              ))}
            </ReportTable>
          </ReportSection>
        </div>

        <ReportNote title="How this is counted">
          <Typography.Paragraph>
            A car counts in the month it is registered, under the fuel type LTA
            records against it.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Fuel types are LTA's own values, kept unmerged: Petrol-Electric and
            Petrol-Electric (Plug-In) are counted separately rather than
            grouped.
          </Typography.Paragraph>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/fuel-types"
          >
            All fuel types →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/registrations"
          >
            Every registration this month →
          </Link>
          {isElectric ? (
            <Link
              className="font-bold text-accent-strong text-base"
              href="/cars/electric-vehicles"
            >
              Electric vehicles in depth →
            </Link>
          ) : null}
        </ReportNote>
      </div>
    </>
  );
}
