import { Skeleton, Typography } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { formatOrdinal } from "@motormetrics/utils/format-ordinal";
import { slugify } from "@motormetrics/utils/slugify";
import { typeDetailMeta } from "@web/app/(main)/(dashboard)/cars/components/category/type-detail";
import {
  DEFAULT_PERIOD,
  PERIOD_LABELS,
  PERIODS,
  periodRange,
  periodWindow,
  SERIES_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period";
import { PeriodSegment } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period-segment";
import { RegistrationsChart } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/registrations-chart";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MonthMenu } from "@web/components/shared/month-menu";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
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
import { checkVehicleTypeIfExist } from "@web/queries/cars";
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
 * A vehicle-only copy of `cars/components/category/type-detail.tsx`, so the
 * vehicle type page can move to the Hybrid comp while the shared report stays
 * in place for any page not yet ported.
 */

const PERIOD_OPTIONS = PERIODS.map((key) => ({
  key,
  label: PERIOD_LABELS[key],
}));

/** How many makes the by-make table lists before it stops. */
const MAKE_LIMIT = 15;

const loadVehicleTypeSearchParams = createLoader({
  month: parseAsString,
  period: parseAsStringLiteral(PERIODS).withDefault(DEFAULT_PERIOD),
});

interface VehicleTypeReportProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<SearchParams>;
}

function share(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}

async function resolveVehicleType(type: string): Promise<string | undefined> {
  return (await checkVehicleTypeIfExist(type))?.vehicleType;
}

export function VehicleTypeReport({
  params,
  searchParams,
}: VehicleTypeReportProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <Suspense fallback={<VehicleTypeHeadSkeleton />}>
        <VehicleTypeHead params={params} searchParams={searchParams} />
      </Suspense>

      <SectionErrorBoundary title="Registration data unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <VehicleTypeContent params={params} searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </OverviewPage>
  );
}

/** Stands in for `PageHead` while the vehicle type resolves. */
function VehicleTypeHeadSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-96 max-w-full sm:ml-auto" />
    </div>
  );
}

async function VehicleTypeHead({
  params,
  searchParams,
}: VehicleTypeReportProps) {
  const { type } = await params;
  const value = await resolveVehicleType(type);

  return (
    <PageHead
      controls={
        <>
          {/* nuqs reads the URL on the client, so the segment needs its own
              boundary to keep the static shell. */}
          <Suspense fallback={<Skeleton className="h-8 w-72" />}>
            <PeriodSegment
              defaultKey={DEFAULT_PERIOD}
              options={PERIOD_OPTIONS}
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-8 w-36" />}>
            <VehicleTypeMonthPicker searchParams={searchParams} />
          </Suspense>
        </>
      }
      eyebrow="Cars · Vehicle types"
      sub={
        <Suspense fallback={<Skeleton className="h-5 w-72" />}>
          <VehicleTypePeriodSub searchParams={searchParams} />
        </Suspense>
      }
      title={value ? formatVehicleType(value) : "Vehicle type"}
    />
  );
}

/** Names the months the page reports, what it counts and its source. */
async function VehicleTypePeriodSub({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth, period } =
    await loadVehicleTypeSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  return (
    <>
      <span className="font-semibold text-foreground">
        {periodRange(period, month)}
      </span>{" "}
      · new registrations, not the fleet on the road · Source: LTA via DataMall
    </>
  );
}

async function VehicleTypeMonthPicker({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } =
    await loadVehicleTypeSearchParams(searchParams);

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

async function VehicleTypeContent({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: VehicleTypeReportProps) {
  const [{ type }, { month: parsedMonth, period }] = await Promise.all([
    paramsPromise,
    loadVehicleTypeSearchParams(searchParamsPromise),
  ]);
  const [{ month }, value] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    resolveVehicleType(type),
  ]);
  if (!value) {
    notFound();
  }

  const displayName = formatVehicleType(value);
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
    getTypeMonthlySeries("vehicleType", value, month, SERIES_MONTHS),
    getTypeDistributionInWindow("vehicleType", from, to),
    getTypeDistributionInWindow("vehicleType", previousFrom, previousTo),
    getTypeMakesInWindow("vehicleType", value, from, to),
    getTypeMakesInWindow("vehicleType", value, previousFrom, previousTo),
    getTypeCrossMixInWindow("vehicleType", value, from, to),
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
  const electricCount =
    crossMix.find((row) => row.name === "Electric")?.count ?? 0;
  const marketShare = `${share(typeTotal, marketTotal).toFixed(1)}%`;

  // The comp's two-by-two grid beside the headline figure.
  const stats = [
    {
      label: "Share of registrations",
      note: periodLabel.toLowerCase(),
      value: marketShare,
    },
    {
      label: "Electric share",
      note: `of ${displayName} registrations`,
      value: `${share(electricCount, typeTotal).toFixed(1)}%`,
    },
    {
      label: "Makes",
      note: "with registrations",
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

  const monthRows = [...series].reverse();
  const monthShareLeader = series.length
    ? Math.max(...series.map(({ count, total }) => share(count, total)))
    : 0;

  const { title, description, canonical } = typeDetailMeta(
    "vehicle-types",
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
            { name: "Vehicle types", path: "/cars/vehicle-types" },
            { name: displayName, path: `/cars/vehicle-types/${type}` },
          ]),
        }}
      />

      <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="flex min-w-0 flex-col gap-3">
          <span className="font-semibold text-muted text-xs">
            {displayName} registrations
          </span>
          <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
            <Count value={typeTotal} />
          </span>
          <Typography.Paragraph className="tabular-nums" color="muted">
            <DeltaChip
              className="font-semibold text-foreground"
              value={percentageChange(typeTotal, previousTypeTotal)}
            />{" "}
            against the same period a year earlier
          </Typography.Paragraph>
          <Typography.Paragraph
            className="tabular-nums"
            color="muted"
            size="sm"
          >
            {periodLabel} · {marketShare} of all registrations
            {rank > 0
              ? ` · ${formatOrdinal(rank)} largest of ${distribution.length} vehicle types`
              : ""}
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

      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption={`${periodRange("12m", month)} · hover or tap a bar for its value`}
          eyebrow="Trend"
          title={`${displayName} registrations by month`}
        />
        <RegistrationsChart
          data={series.map(({ count, month: seriesMonth, total }, index) => {
            const isSelected = seriesMonth === month;
            return {
              count,
              earlier: isSelected ? 0 : count,
              label: formatChartMonth(seriesMonth),
              latest: isSelected ? count : 0,
              market: total,
              title: formatMonthLabel(seriesMonth),
              year:
                index === 0 || seriesMonth.endsWith("-01")
                  ? seriesMonth.slice(0, 4)
                  : "",
            };
          })}
          ticks={axisTicks(
            series.map(({ count }) => count),
            { zero: true },
          )}
          vehicleType={displayName}
        />
        <SourceNote>
          New {displayName} registrations, all makes and fuel types. The chart
          covers the {SERIES_MONTHS} months to the selected month whatever the
          period switch is set to. Y-axis starts at zero.
        </SourceNote>
      </section>

      <Hairline />

      <ReportSection
        caption={`${periodLabel}${makes.length > MAKE_LIMIT ? ` · top ${MAKE_LIMIT} of ${makes.length} makes` : ""}`}
        title={`${displayName} by make`}
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
        caption={`${displayName} against the whole market`}
        title="Month by month"
      >
        <ReportTable
          columns={[
            { label: "Month" },
            { align: "end", label: displayName },
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
          <ReportSection
            caption={periodLabel}
            title="Against other vehicle types"
          >
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
                      {formatVehicleType(peer.name)}
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
            caption={`${displayName} · ${periodLabel.toLowerCase()}`}
            title="By fuel type"
          >
            <ReportTable
              columns={[
                { label: "Fuel type" },
                { align: "end", label: "Registrations" },
                { align: "end", label: "Share" },
                { label: "", width: "200px" },
              ]}
            >
              {crossMix.map(({ count, name }, index) => (
                <ReportRow key={name}>
                  <ReportCell className="font-semibold">{name}</ReportCell>
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
            A car counts in the month it is registered, under the vehicle type
            LTA records against it.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Vehicle types are LTA's own values, shortened only for display — the
            underlying figures are unchanged.
          </Typography.Paragraph>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/vehicle-types"
          >
            All vehicle types →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/registrations"
          >
            Every registration this month →
          </Link>
        </ReportNote>
      </div>
    </>
  );
}
