import { cn, Skeleton, Typography } from "@heroui/react";
import { formatOrdinal } from "@motormetrics/utils/format-ordinal";
import { slugify } from "@motormetrics/utils/slugify";
import { summariseType } from "@web/app/(main)/(dashboard)/cars/components/category/type-summary";
import { typeDetailMeta } from "@web/app/(main)/(dashboard)/cars/components/type-meta";
import { MakeTable } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/make-table";
import { MonthTable } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/month-table";
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
import { Count } from "@web/components/shared/report-table";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { Text } from "@web/components/shared/text";
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
import { getCarLogoMap } from "@web/queries/logos";
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

/**
 * The comp's fuel colours: slate for electric and hybrid, sand for petrol.
 * Any other LTA fuel type takes the palest slate step.
 */
const FUEL_COLOURS: Record<string, string> = {
  Electric: "var(--chart-1)",
  Petrol: "var(--chart-sand)",
  "Petrol-Electric": "var(--chart-3)",
  "Petrol-Electric (Plug-In)": "var(--chart-4)",
};

function fuelColour(fuelType: string): string {
  return FUEL_COLOURS[fuelType] ?? "var(--chart-6)";
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
  const [{ month }, value, logoUrlBySlug] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    resolveVehicleType(type),
    getCarLogoMap(),
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
  const previousMarketTotal = previousDistribution.reduce(
    (sum, row) => sum + row.count,
    0,
  );
  const summary = summariseType({
    count: typeTotal,
    label: displayName,
    periodLabel: periodRange(period, month),
    previousShare:
      previousMarketTotal > 0
        ? share(previousTypeTotal, previousMarketTotal)
        : undefined,
    share: share(typeTotal, marketTotal),
  });
  const peerLeader = distribution[0]?.count ?? 0;

  const previousByMake = new Map(
    previousMakes.map((row) => [row.make, row.count]),
  );
  const makeRows = makes.slice(0, MAKE_LIMIT).map(({ count, make }, index) => ({
    change: percentageChange(count, previousByMake.get(make) ?? 0),
    count,
    logoUrl: logoUrlBySlug[slugify(make)] ?? null,
    make,
    rank: index + 1,
  }));

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

      <div className="flex flex-col gap-5">
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
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {summary}
        </Typography.Paragraph>
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

      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption={`${periodLabel}${makes.length > MAKE_LIMIT ? ` · top ${MAKE_LIMIT} of ${makes.length} makes` : ""}`}
          eyebrow="Makes"
          title={`${displayName} by make`}
        />
        <MakeTable
          rows={makeRows}
          total={typeTotal}
          vehicleType={displayName}
        />
        <SourceNote>
          Share is of {typeTotal.toLocaleString("en-SG")} {displayName}{" "}
          registrations in the period. Change compares against the same period a
          year earlier. Colour is not used for direction.
        </SourceNote>
      </section>

      <Hairline />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-11 lg:gap-14">
        <section className="flex min-w-0 flex-col gap-4 lg:col-span-6">
          <SectionHead
            caption={`${periodRange("12m", month)}, newest first`}
            eyebrow="Month by month"
            title={`${displayName} against the whole market`}
          />
          <MonthTable
            rows={[...series].reverse()}
            selectedMonth={month}
            vehicleType={displayName}
          />
          <SourceNote>
            Share is {displayName} registrations as a share of all new cars that
            month.
          </SourceNote>
        </section>

        <div className="flex min-w-0 flex-col gap-10 lg:col-span-5">
          <section className="flex min-w-0 flex-col gap-4">
            <SectionHead
              caption={periodRange(period, month)}
              eyebrow="Peers"
              link={{ href: "/cars/vehicle-types", label: "All vehicle types" }}
              title="Against other vehicle types"
            />
            <ul className="flex flex-col">
              {distribution.map((peer) => {
                const isSelected = peer.name === value;

                return (
                  <li
                    aria-current={isSelected ? "page" : undefined}
                    className="flex items-center gap-3 border-separator border-b py-2.5"
                    key={peer.name}
                  >
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-sm md:w-36 md:flex-none",
                        isSelected && "font-semibold text-accent-strong",
                      )}
                    >
                      {formatVehicleType(peer.name)}
                    </span>
                    <span className="block h-2.5 min-w-0 flex-1 bg-surface-secondary max-md:hidden">
                      <span
                        className="block h-full rounded-r-xs"
                        style={{
                          background: isSelected
                            ? "var(--chart-1)"
                            : "var(--chart-5)",
                          width: `${share(peer.count, peerLeader).toFixed(1)}%`,
                        }}
                      />
                    </span>
                    <span className="w-16 shrink-0 text-right font-semibold text-sm tabular-nums">
                      {peer.count.toLocaleString("en-SG")}
                    </span>
                  </li>
                );
              })}
            </ul>
            <SourceNote>
              New car registrations by vehicle type in the period.
            </SourceNote>
          </section>

          <section className="flex min-w-0 flex-col gap-4">
            <SectionHead
              caption={`${displayName} · ${periodLabel.toLowerCase()}`}
              eyebrow="Mix"
              title="By fuel type"
            />
            {/* One segment per fuel type, sized by its share of the type. */}
            <div aria-hidden="true" className="flex h-4 gap-0.5">
              {crossMix.map(({ count, name }) => (
                <span
                  className="block h-full"
                  key={name}
                  style={{
                    background: fuelColour(name),
                    width: `${share(count, typeTotal).toFixed(1)}%`,
                  }}
                />
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex items-end gap-2.5 border-border border-b pb-2 font-semibold text-muted text-xs">
                <span className="w-3 shrink-0" />
                <span className="min-w-0 flex-1">Fuel type</span>
                <span className="w-16 shrink-0 text-right">Cars</span>
                <span className="w-14 shrink-0 text-right">Share</span>
              </div>
              <ul className="flex flex-col">
                {crossMix.map(({ count, name }) => (
                  <li
                    className="flex items-center gap-2.5 border-separator border-b py-2.5"
                    key={name}
                  >
                    <span
                      className="block size-3 shrink-0 rounded-xs"
                      style={{ background: fuelColour(name) }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {name}
                    </span>
                    <span className="w-16 shrink-0 text-right text-sm tabular-nums">
                      {count.toLocaleString("en-SG")}
                    </span>
                    <span className="w-14 shrink-0 text-right font-semibold text-sm tabular-nums">
                      {share(count, typeTotal).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <SourceNote>
              Share of {displayName} registrations in the period.
            </SourceNote>
          </section>
        </div>
      </div>

      <Hairline />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
        <section className="flex flex-col gap-2.5">
          <Text.Paragraph color="muted" eyebrow size="xs" weight="semibold">
            How this is counted
          </Text.Paragraph>
          <Typography.Paragraph size="sm">
            A car counts in the month it is registered, under the vehicle type
            LTA records against it.
          </Typography.Paragraph>
          <Typography.Paragraph size="sm">
            Vehicle types are LTA's own values, shortened only for display. The
            underlying figures are unchanged.
          </Typography.Paragraph>
        </section>
        <nav
          aria-label="Related pages"
          className="flex flex-col gap-2.5 lg:self-end"
        >
          {[
            { href: "/cars/vehicle-types", label: "All vehicle types" },
            {
              href: "/cars/registrations",
              label: "Every registration this month",
            },
          ].map(({ href, label }) => (
            <Link
              className="whitespace-nowrap font-semibold text-accent-strong text-sm hover:text-accent-deep"
              href={href}
              key={href}
            >
              {label} →
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
