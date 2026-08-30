import { Typography } from "@heroui/react";
import { formatDateToMonthYear, slugify } from "@motormetrics/utils";
import { TypeChart } from "@web/app/(main)/(dashboard)/cars/components/category/type-chart";
import { PeriodTabs } from "@web/app/(main)/(dashboard)/cars/components/category/type-filters";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MonthSelector } from "@web/components/shared/month-selector";
import { PageHead } from "@web/components/shared/page-head";
import {
  Report,
  ReportFilterBar,
  ReportHeadline,
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
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import {
  checkFuelTypeIfExist,
  checkVehicleTypeIfExist,
} from "@web/queries/cars";
import {
  getTypeCrossMixInWindow,
  getTypeDistributionInWindow,
  getTypeMakesInWindow,
  getTypeMonthlySeries,
  type TypeDimension,
} from "@web/queries/cars/type-detail";
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
 * month the header selector picks. Lives here beside the loader that validates
 * it; `PeriodTabs` takes the labels as a prop so the vocabulary is stated once.
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

export const typeSearchParams = {
  month: parseAsString,
  period: parseAsStringLiteral(PERIODS).withDefault(DEFAULT_PERIOD),
};
export const loadTypeSearchParams = createLoader(typeSearchParams);

export interface TypeDetailConfig {
  category: "fuel-types" | "vehicle-types";
  description: string;
}

interface TypeDetailProps {
  config: TypeDetailConfig;
  params: Promise<{ type: string }>;
  searchParams: Promise<SearchParams>;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** `2025-10` → `Oct`. Twelve consecutive months never repeat a label. */
function monthLabel(month: string): string {
  const monthNumber = Number(month.split("-")[1]);
  return MONTH_LABELS[monthNumber - 1] ?? month;
}

/** `2025-10`, -12 → `2024-10`. */
function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));

  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
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

/** Percentage change, guarding the division so an absent base reads as flat. */
function percentageChange(current: number, previous: number): number {
  if (!previous) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

/** `1` → `1st`, `2` → `2nd`, `13` → `13th`. */
function ordinal(rank: number): string {
  const lastTwo = rank % 100;
  if (lastTwo >= 11 && lastTwo <= 13) {
    return `${rank}th`;
  }

  const suffix = { 1: "st", 2: "nd", 3: "rd" }[rank % 10] ?? "th";

  return `${rank}${suffix}`;
}

function share(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}

/**
 * The vocabulary each route uses, kept in one place so no string on the page
 * drifts into the comp's synonyms. `cars.fuelType` is a fuel type and
 * `cars.vehicleType` is a vehicle type — never a powertrain or a body style.
 */
const CATEGORY_TERMS = {
  "fuel-types": {
    crossLabel: "Vehicle type",
    crossTitle: "By vehicle type",
    dimension: "fuelType",
    indexLabel: "Fuel types",
    noun: "fuel type",
    plural: "fuel types",
  },
  "vehicle-types": {
    crossLabel: "Fuel type",
    crossTitle: "By fuel type",
    dimension: "vehicleType",
    indexLabel: "Vehicle types",
    noun: "vehicle type",
    plural: "vehicle types",
  },
} as const satisfies Record<
  TypeDetailConfig["category"],
  {
    crossLabel: string;
    crossTitle: string;
    dimension: TypeDimension;
    indexLabel: string;
    noun: string;
    plural: string;
  }
>;

/** LTA records vehicle types verbatim; only the display passes through the map. */
function displayValue(
  category: TypeDetailConfig["category"],
  value: string,
): string {
  return category === "vehicle-types" ? formatVehicleType(value) : value;
}

async function resolveType(
  category: TypeDetailConfig["category"],
  type: string,
): Promise<string | undefined> {
  if (category === "fuel-types") {
    return (await checkFuelTypeIfExist(type))?.fuelType;
  }

  return (await checkVehicleTypeIfExist(type))?.vehicleType;
}

export async function TypeDetail({
  config,
  params,
  searchParams,
}: TypeDetailProps) {
  const { type } = await params;
  const value = await resolveType(config.category, type);
  const terms = CATEGORY_TERMS[config.category];

  return (
    <Report>
      <PageHead
        controls={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <TypeDetailHeaderMeta searchParams={searchParams} />
          </Suspense>
        }
        description={`New car registrations recorded against this ${terms.noun}, month by month — not the fleet already on the road.`}
        title={value ? displayValue(config.category, value) : "Type overview"}
      />

      <SectionErrorBoundary title="Registration data unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <TypeDetailContent
            config={config}
            params={params}
            searchParams={searchParams}
          />
        </Suspense>
      </SectionErrorBoundary>
    </Report>
  );
}

async function TypeDetailHeaderMeta({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } =
    await loadTypeSearchParams(searchParamsPromise);

  const [{ wasAdjusted }, months] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    fetchMonthsForCars(),
  ]);

  return (
    <MonthSelector
      latestMonth={months[0]}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}

async function TypeDetailContent({
  config,
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  config: TypeDetailConfig;
  params: Promise<{ type: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ type }, { month: parsedMonth, period }] = await Promise.all([
    paramsPromise,
    loadTypeSearchParams(searchParamsPromise),
  ]);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  const value = await resolveType(config.category, type);
  if (!value) {
    notFound();
  }

  const terms = CATEGORY_TERMS[config.category];
  const dimension: TypeDimension = terms.dimension;
  const displayName = displayValue(config.category, value);
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
    getTypeMonthlySeries(dimension, value, month, SERIES_MONTHS),
    getTypeDistributionInWindow(dimension, from, to),
    getTypeDistributionInWindow(dimension, previousFrom, previousTo),
    getTypeMakesInWindow(dimension, value, from, to),
    getTypeMakesInWindow(dimension, value, previousFrom, previousTo),
    getTypeCrossMixInWindow(dimension, value, from, to),
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
  const electricCount =
    crossMix.find((row) => row.name === "Electric")?.count ?? 0;

  const chartData = series.map(({ count, month: seriesMonth }) => ({
    count,
    label: monthLabel(seriesMonth),
  }));
  const monthRows = [...series].reverse();
  const monthShareLeader = series.length
    ? Math.max(...series.map(({ count, total }) => share(count, total)))
    : 0;

  const isElectricFuelType =
    config.category === "fuel-types" && value === "Electric";

  const title = `${displayName} Cars in Singapore`;
  const description = `${displayName} car registrations in Singapore. Explore registration trends, statistics, and distribution by ${terms.noun} for each month.`;
  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}/cars/${config.category}/${type}`,
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
            {
              name: terms.indexLabel,
              path: `/cars/${config.category}`,
            },
            {
              name: displayName,
              path: `/cars/${config.category}/${type}`,
            },
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
      {isElectricFuelType ? (
        <Link
          className="group flex flex-wrap items-baseline gap-3 rounded-xl border border-accent-border bg-accent-soft-2 px-6 py-5"
          href="/cars/electric-vehicles"
        >
          <Typography.Paragraph className="font-bold text-accent-strong text-lg group-hover:underline">
            The full electric picture →
          </Typography.Paragraph>
          <Typography.Paragraph
            color="muted"
            size="sm"
            className="text-muted-strong"
          >
            Adoption, charging and the makes leading it, on one page
          </Typography.Paragraph>
        </Link>
      ) : null}

      <ReportHeadline
        delta={
          <DeltaChip value={percentageChange(typeTotal, previousTypeTotal)} />
        }
        label={`${displayName} registrations`}
        stats={
          <>
            <ReportStat
              label="Share of registrations"
              note={periodLabel.toLowerCase()}
              value={`${share(typeTotal, marketTotal).toFixed(1)}%`}
            />
            {config.category === "vehicle-types" ? (
              <ReportStat
                label="Electric share"
                note={`of ${displayName} registrations`}
                value={`${share(electricCount, typeTotal).toFixed(1)}%`}
              />
            ) : (
              <ReportStat
                label="Rank"
                note={`of ${distribution.length} ${terms.plural}`}
                value={rank > 0 ? `#${rank}` : "—"}
              />
            )}
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
        sub={`${periodLabel} · ${share(typeTotal, marketTotal).toFixed(1)}% of all registrations${rank > 0 ? ` · ${ordinal(rank)} largest of ${distribution.length} ${terms.plural}` : ""}`}
        value={<Count value={typeTotal} />}
      />

      <TypeChart data={chartData} />

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
            title={`Against other ${terms.plural}`}
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
                      {displayValue(config.category, peer.name)}
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
            title={terms.crossTitle}
          >
            <ReportTable
              columns={[
                { label: terms.crossLabel },
                { align: "end", label: "Registrations" },
                { align: "end", label: "Share" },
                { label: "", width: "200px" },
              ]}
            >
              {crossMix.map(({ count, name }, index) => (
                <ReportRow key={name}>
                  <ReportCell className="font-semibold">
                    {config.category === "fuel-types"
                      ? formatVehicleType(name)
                      : name}
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

        <aside className="flex flex-col gap-3.5 border-border lg:border-l lg:pl-10">
          <Typography.Heading level={3} className="text-lg">
            How this is counted
          </Typography.Heading>
          <Typography.Paragraph>
            A car counts in the month it is registered, under the {terms.noun}{" "}
            LTA records against it.
          </Typography.Paragraph>
          <Typography.Paragraph>
            {config.category === "fuel-types"
              ? "Fuel types are LTA's own values, kept unmerged: Petrol-Electric and Petrol-Electric (Plug-In) are counted separately rather than grouped."
              : "Vehicle types are LTA's own values, shortened only for display — the underlying figures are unchanged."}
          </Typography.Paragraph>
          <Link
            className="font-bold text-accent-strong text-base"
            href={`/cars/${config.category}`}
          >
            All {terms.plural} →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/registrations"
          >
            Every registration this month →
          </Link>
          {isElectricFuelType ? (
            <Link
              className="font-bold text-accent-strong text-base"
              href="/cars/electric-vehicles"
            >
              Electric vehicles in depth →
            </Link>
          ) : null}
        </aside>
      </div>
    </>
  );
}
