import { Skeleton, Typography } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { slugify } from "@motormetrics/utils/slugify";
import { TypeChart } from "@web/app/(main)/(dashboard)/cars/components/category/type-chart";
import { typeDetailMeta } from "@web/app/(main)/(dashboard)/cars/components/category/type-detail";
import { PeriodSegment } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/period-segment";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MonthMenu } from "@web/components/shared/month-menu";
import { OverviewPage, SectionLink } from "@web/components/shared/overview";
import { PageHead } from "@web/components/shared/page-head";
import { ReportNote, ReportSection } from "@web/components/shared/report";
import {
  Count,
  DeltaText,
  ReportCell,
  ReportRow,
  ReportTable,
  ShareBar,
} from "@web/components/shared/report-table";
import { SkeletonCard } from "@web/components/shared/skeleton";
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
  formatMonthShortLabel,
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

/** "August 2026", "2026 year to date" or "Last 12 months", as the comp words each window. */
function periodCaption(period: Period, month: string): string {
  if (period === "month") {
    return formatMonthLabel(month);
  }

  if (period === "ytd") {
    return `${month.slice(0, 4)} year to date`;
  }

  return PERIOD_LABELS["12m"];
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

  const periodLabel = periodCaption(period, month);

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

  // The busiest month in the charted year, the latest of any tie.
  const bestMonth = series.reduce<(typeof series)[number] | undefined>(
    (best, point) => (!best || point.count >= best.count ? point : best),
    undefined,
  );

  const chartData = series.map(({ count, month: seriesMonth }) => ({
    count,
    label: formatChartMonth(seriesMonth),
  }));
  const monthRows = [...series].reverse();
  const monthShareLeader = series.length
    ? Math.max(...series.map(({ count, total }) => share(count, total)))
    : 0;

  const isElectric = value === "Electric";
  const marketShare = `${share(typeTotal, marketTotal).toFixed(1)}%`;

  // The comp's two-by-two grid beside the headline figure.
  const stats = [
    { label: "Share of registrations", note: periodLabel, value: marketShare },
    {
      label: "Rank",
      note: `of ${distribution.length} fuel types`,
      value: rank > 0 ? `#${rank}` : "—",
    },
    {
      label: "Makes",
      note: `with ${value} registrations`,
      value: makes.length.toLocaleString("en-SG"),
    },
    {
      label: "Best month",
      note: bestMonth
        ? `${formatMonthShortLabel(bestMonth.month)} · last ${series.length} months`
        : `last ${series.length} months`,
      value: (bestMonth?.count ?? 0).toLocaleString("en-SG"),
    },
  ];

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

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-4">
          <PeriodSegment defaultKey={DEFAULT_PERIOD} options={PERIOD_OPTIONS} />
          {/* The comp draws a second, wide bento page for Electric. That page
              is deliberately not built — `/cars/electric-vehicles` already
              tells the electric story — so this links there instead. */}
          {isElectric ? (
            <SectionLink href="/cars/electric-vehicles">
              Adoption, charging and leading makes
            </SectionLink>
          ) : null}
        </div>

        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="flex min-w-0 flex-col gap-3">
            <span className="font-semibold text-muted text-xs">
              {value} cars registered · {periodLabel}
            </span>
            <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
              <Count value={typeTotal} />
            </span>
            <Typography.Paragraph className="tabular-nums" color="muted">
              <DeltaChip
                className="font-semibold text-foreground"
                value={percentageChange(typeTotal, previousTypeTotal)}
              />{" "}
              on a year earlier
            </Typography.Paragraph>
            <Typography.Paragraph
              className="tabular-nums"
              color="muted"
              size="sm"
            >
              {marketShare} of all new car registrations
            </Typography.Paragraph>
          </div>
          <div className="grid grid-cols-2 border-border border-t">
            {stats.map((stat) => (
              <div
                className="flex min-w-0 flex-col gap-1 border-separator border-b py-3.5 pr-4 even:border-l even:pl-4"
                key={stat.label}
              >
                <span className="truncate font-semibold text-muted text-xs">
                  {stat.label}
                </span>
                <span className="font-semibold text-xl tabular-nums tracking-tight md:text-2xl">
                  {stat.value}
                </span>
                <span className="truncate text-muted text-xs">{stat.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
            caption={`${value} · ${periodLabel}`}
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
