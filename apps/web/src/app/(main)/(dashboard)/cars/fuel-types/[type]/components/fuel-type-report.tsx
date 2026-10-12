import { cn, Skeleton, Typography } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
import { summariseType } from "@web/app/(main)/(dashboard)/cars/components/category/type-summary";
import { typeDetailMeta } from "@web/app/(main)/(dashboard)/cars/components/type-meta";
import { buildFuelTypeFaqs } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/faq-data";
import { MakeTable } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/make-table";
import { MonthTable } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/month-table";
import { PeriodSegment } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/period-segment";
import { RegistrationsChart } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/registrations-chart";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MonthMenu } from "@web/components/shared/month-menu";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { Count } from "@web/components/shared/report-table";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { checkFuelTypeIfExist } from "@web/queries/cars";
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
  const [{ month }, value, logoUrlBySlug] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    resolveFuelType(type),
    getCarLogoMap(),
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
  const previousMarketTotal = previousDistribution.reduce(
    (sum, row) => sum + row.count,
    0,
  );
  const summary = summariseType({
    count: typeTotal,
    label: value,
    periodLabel: periodLabel,
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
  const faqs = buildFuelTypeFaqs(value);
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
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {summary}
        </Typography.Paragraph>
      </div>

      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption={`${series.length} months to ${formatMonthLabel(month)} · hover or tap a bar for its value`}
          eyebrow="Trend"
          title={`${value} registrations by month`}
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
          fuelType={value}
          ticks={axisTicks(
            series.map(({ count }) => count),
            { zero: true },
          )}
        />
        <SourceNote>
          {value} new car registrations each month. Y-axis starts at zero.
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption={`${periodLabel}${makes.length > MAKE_LIMIT ? ` · top ${MAKE_LIMIT} of ${makes.length} makes` : ""}`}
          eyebrow="Makes"
          title={`${value} by make`}
        />
        <MakeTable fuelType={value} rows={makeRows} total={typeTotal} />
        <SourceNote>
          Share is of all {value} registrations in the period. Change is against
          the same period a year earlier; colour is not used for direction.
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption={`${series.length} months to ${formatMonthLabel(month)}`}
          eyebrow="Month by month"
          title={`${value} against the whole market`}
        />
        <MonthTable
          fuelType={value}
          rows={[...series].reverse()}
          selectedMonth={month}
        />
        <SourceNote>
          Share is {value} registrations as a share of all new cars that month;
          bars run from 0 to 100%. Change is in {value} registrations against
          the previous month.
        </SourceNote>
      </section>

      <Hairline />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-14">
        <section className="flex min-w-0 flex-col gap-4">
          <SectionHead
            caption={`${periodLabel} · new registrations`}
            eyebrow="Comparison"
            link={{ href: "/cars/fuel-types", label: "All fuel types" }}
            title="Against other fuel types"
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
                      "min-w-0 flex-1 truncate text-sm md:w-44 md:flex-none",
                      isSelected && "font-semibold text-accent-strong",
                    )}
                  >
                    {peer.name}
                  </span>
                  <span className="block h-2.5 w-24 shrink-0 bg-surface-secondary md:w-auto md:flex-1">
                    <span
                      className="block h-full rounded-r-xs"
                      style={{
                        background: isSelected
                          ? "var(--chart-1)"
                          : "var(--chart-3)",
                        width: `${share(peer.count, peerLeader).toFixed(1)}%`,
                      }}
                    />
                  </span>
                  <span className="w-16 shrink-0 text-right font-semibold text-sm tabular-nums md:w-20">
                    {peer.count.toLocaleString("en-SG")}
                  </span>
                </li>
              );
            })}
          </ul>
          <SourceNote>
            LTA's own fuel types, kept unmerged: Petrol-Electric and
            Petrol-Electric (Plug-In) are counted separately.
          </SourceNote>
        </section>

        <section className="flex min-w-0 flex-col gap-4">
          <SectionHead
            caption={`${value} · ${periodLabel}`}
            eyebrow="Body types"
            title="By vehicle type"
          />
          <div className="flex flex-col">
            <div className="flex items-end gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
              <span className="min-w-0 flex-1">Vehicle type</span>
              <span className="w-16 shrink-0 text-right md:w-20">Cars</span>
              <span className="w-14 shrink-0 text-right md:w-36">Share</span>
            </div>
            <ul className="flex flex-col">
              {crossMix.map(({ count, name }, index) => (
                <li
                  className="flex items-center gap-3 border-separator border-b py-2.5"
                  key={name}
                >
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {formatVehicleType(name)}
                  </span>
                  <span className="w-16 shrink-0 text-right font-semibold text-sm tabular-nums md:w-20">
                    {count.toLocaleString("en-SG")}
                  </span>
                  <span className="flex w-14 shrink-0 items-center justify-end gap-2.5 md:w-36">
                    <span className="block h-2.5 min-w-0 flex-1 bg-surface-secondary max-md:hidden">
                      <span
                        className="block h-full rounded-r-xs"
                        style={{
                          background:
                            index === 0 ? "var(--chart-1)" : "var(--chart-3)",
                          width: `${share(count, crossMix[0]?.count ?? 0).toFixed(1)}%`,
                        }}
                      />
                    </span>
                    <span className="w-12 shrink-0 text-right text-muted-strong text-sm tabular-nums">
                      {share(count, typeTotal).toFixed(1)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <SourceNote>
            A car counts in the month it is registered, under the fuel type LTA
            records against it.
          </SourceNote>
        </section>
      </div>

      <nav
        aria-label="Related pages"
        className="flex flex-wrap gap-x-5 gap-y-2"
      >
        {[
          { href: "/cars/fuel-types", label: "All fuel types" },
          {
            href: "/cars/registrations",
            label: "Every registration this month",
          },
          ...(isElectric
            ? [
                {
                  href: "/cars/electric-vehicles",
                  label: "Electric vehicles in depth",
                },
              ]
            : []),
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

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: faqs }]),
        }}
      />
      <PageFaq faqs={faqs} />
    </>
  );
}
