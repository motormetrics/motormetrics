import { EmptyState } from "@heroui-pro/react";
import { ClassesTable } from "@web/app/(main)/(dashboard)/cars/annual/components/classes-table";
import {
  ElectricFleet,
  FLEET_YEARS,
} from "@web/app/(main)/(dashboard)/cars/annual/components/electric-fleet";
import { PopulationByYear } from "@web/app/(main)/(dashboard)/cars/annual/components/population-by-year";
import {
  buildPopulationSeries,
  CARS,
  rankClasses,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { FigureCard } from "@web/components/shared/figure-card";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import { OverviewPage } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import { baseOpenGraph } from "@web/lib/metadata/social";
import { getVehiclePopulationByCategoryAndFuelType } from "@web/queries/vehicle-population";
import { changeRatio } from "@web/utils/change-ratio";
import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import { cache } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const metadata: Metadata = {
  title: "Annual Vehicle Population Singapore",
  description:
    "Annual motor vehicle population in Singapore by vehicle type and fuel type. Track the growth of electric, hybrid, petrol, and diesel vehicles on Singapore roads.",
  openGraph: {
    ...baseOpenGraph,
    title: "Annual Vehicle Population - Singapore",
    description:
      "Explore annual vehicle population trends in Singapore with interactive charts and key statistics.",
    url: `${SITE_URL}/cars/annual`,
  },
  alternates: {
    canonical: "/cars/annual",
  },
};

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Annual Vehicle Population",
  description:
    "Motor vehicle population in Singapore by vehicle type and type of fuel used, with interactive charts and year-over-year analysis",
  url: `${SITE_URL}/cars/annual`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

/** Years the KPI sparklines span. */
const TREND_YEARS = 10;

/**
 * One query feeds every block: the grid of year × class × fuel is small
 * enough to pivot once on the server. The query is cached and the page reads
 * no search params, so nothing here needs a Suspense boundary; `cache`
 * shares the pivot between the blocks that call it.
 */
const loadPopulation = cache(async () => {
  const rows = await getVehiclePopulationByCategoryAndFuelType();
  const data = buildPopulationSeries(
    rows.map((row) => ({
      fuelType: row.fuelType,
      name: row.category,
      total: row.total,
      year: row.year,
    })),
  );
  const cars = data?.entities.find((entity) => entity.name === CARS);

  return data && cars
    ? { cars, classes: rankClasses(data.entities), data }
    : null;
});

/** "LTA data to 31 December 2025". */
async function PopulationAsOf() {
  const population = await loadPopulation();
  return population ? (
    <>LTA data to 31 December {population.data.year}</>
  ) : null;
}

/** A year-on-year change, in percent, when the year before is on record. */
const yearChange = (series: number[], previousYear: string | null) => {
  const [current, previous] = [series.at(-1), series.at(-2)];
  return current !== undefined && previous && previousYear
    ? {
        label: `vs ${previousYear}`,
        value: changeRatio(current, previous) * 100,
      }
    : undefined;
};

/**
 * Cars on the road, every vehicle class together and the electric share of
 * cars, each at the latest year end.
 */
async function PopulationKpis() {
  const population = await loadPopulation();
  if (!population) {
    return null;
  }

  const { cars, data } = population;
  const allVehicles = data.years.map((_, index) =>
    data.entities.reduce((sum, entity) => sum + (entity.series[index] ?? 0), 0),
  );
  const electricShare = cars.series.map((total, index) =>
    total > 0 ? ((cars.electric[index] ?? 0) / total) * 100 : 0,
  );
  const note = `31 December ${data.year}`;
  const [share, shareBefore] = [electricShare.at(-1), electricShare.at(-2)];

  const tiles: KpiTile[] = [
    {
      change: yearChange(cars.series, data.previousYear),
      format: "count",
      note,
      title: "Cars on the road",
      trend: cars.series.slice(-TREND_YEARS),
      value: cars.series.at(-1) ?? 0,
    },
    {
      change: yearChange(allVehicles, data.previousYear),
      format: "count",
      note,
      title: "All vehicles",
      trend: allVehicles.slice(-TREND_YEARS),
      value: allVehicles.at(-1) ?? 0,
    },
    {
      change:
        shareBefore !== undefined && data.previousYear
          ? {
              label: `vs ${data.previousYear}`,
              value: (share ?? 0) - shareBefore,
            }
          : undefined,
      format: "percent",
      href: "/cars/electric-vehicles",
      note: `of cars, ${note}`,
      title: "Electric share",
      trend: electricShare.slice(-TREND_YEARS),
      value: share ?? 0,
    },
  ];

  return <KpiTiles tiles={tiles} />;
}

/** The two charts and the classes table, or the empty state. */
async function PopulationFigures() {
  const population = await loadPopulation();

  if (!population) {
    return (
      <EmptyState size="lg">
        <EmptyState.Header>
          <EmptyState.Media variant="icon">
            <BarChart3 />
          </EmptyState.Media>
          <EmptyState.Title>No Data Available Yet</EmptyState.Title>
          <EmptyState.Description className="max-w-sm">
            Annual vehicle population data is not available at the moment.
            Please check back later.
          </EmptyState.Description>
        </EmptyState.Header>
      </EmptyState>
    );
  }

  const { cars, classes, data } = population;
  const fleetFrom = data.years.slice(-FLEET_YEARS)[0];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <FigureCard
          description={`At 31 December, ${data.years[0]} to ${data.year}`}
          title="Cars on the road by year"
        >
          <PopulationByYear entity={cars} years={data.years} />
        </FigureCard>
        <FigureCard
          description={`At 31 December, ${fleetFrom} to ${data.year}`}
          link={{ href: "/cars/electric-vehicles", label: "Electric cars" }}
          title="Electric cars on the road"
        >
          <ElectricFleet entity={cars} years={data.years} />
        </FigureCard>
      </div>

      <FigureCard
        description={`At 31 December ${data.year}${data.previousYear ? `; change on ${data.previousYear}` : ""}`}
        title="All vehicle classes"
      >
        <ClassesTable previousYear={data.previousYear} rows={classes} />
      </FigureCard>
    </>
  );
}

export default function AnnualPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Vehicle Population", path: "/cars/annual" },
          ]),
        }}
      />

      {/* The dashboard template. Everything reads one cached query and no
          search params, so the whole page is part of the static shell. */}
      <OverviewPage className="gap-8 max-md:gap-6">
        <PageToolbar
          actions={<SharePill title="Vehicle population" />}
          asOf={<PopulationAsOf />}
          title="Vehicle population"
        />

        <SectionErrorBoundary title="Key numbers unavailable">
          <PopulationKpis />
        </SectionErrorBoundary>

        <SectionErrorBoundary title="Vehicle population unavailable">
          <PopulationFigures />
        </SectionErrorBoundary>
      </OverviewPage>
    </>
  );
}
