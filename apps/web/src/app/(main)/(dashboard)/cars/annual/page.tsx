import { Typography } from "@heroui/react";
import { EmptyState } from "@heroui-pro/react";
import { ClassesTable } from "@web/app/(main)/(dashboard)/cars/annual/components/classes-table";
import {
  ElectricFleet,
  FLEET_YEARS,
} from "@web/app/(main)/(dashboard)/cars/annual/components/electric-fleet";
import { buildAnnualFaqs } from "@web/app/(main)/(dashboard)/cars/annual/components/faq-data";
import { FuelSplit } from "@web/app/(main)/(dashboard)/cars/annual/components/fuel-split";
import { PopulationByYear } from "@web/app/(main)/(dashboard)/cars/annual/components/population-by-year";
import {
  buildPopulationSeries,
  CARS,
  describeClasses,
  rankClasses,
  summarisePopulation,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import {
  HeadGrid,
  HeadTitle,
  KeysAside,
} from "@web/app/(main)/(dashboard)/cars/components/keys-aside";
import {
  changeLabel,
  RangeHero,
  rangeSummary,
} from "@web/app/(main)/(dashboard)/cars/components/range-hero";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import {
  Hairline,
  OverviewGrid,
  OverviewPage,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { baseOpenGraph } from "@web/lib/metadata/social";
import { getVehiclePopulationByCategoryAndFuelType } from "@web/queries/vehicle-population";
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

const JUMP_LINKS = [
  { href: "#vp-trend", label: "Cars by year" },
  { href: "#vp-classes", label: "All vehicle classes" },
  { href: "#vp-classes", label: "Electric fleet" },
];

const formatCount = (value: number) => value.toLocaleString("en-SG");

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

/** "31 December 2025". */
async function YearEnd() {
  const population = await loadPopulation();
  return population ? `31 December ${population.data.year}` : null;
}

/**
 * Cars on the road at the latest year end, the change on the year before,
 * and where the count sits between the lowest and highest year on record.
 */
async function PopulationHero() {
  const population = await loadPopulation();
  if (!population) {
    return null;
  }

  const { cars, classes, data } = population;
  const current = cars.series.at(-1) ?? 0;
  const previous = cars.series.at(-2);
  const allVehicles = classes.reduce((sum, row) => sum + row.population, 0);
  const range = rangeSummary(
    cars.series,
    current,
    `${data.years.length} years`,
  );
  if (!range) {
    return null;
  }

  return (
    <RangeHero
      change={
        previous !== undefined && data.previousYear
          ? changeLabel(current, previous, data.previousYear)
          : undefined
      }
      context={`${allVehicles > 0 ? `${((current / allVehicles) * 100).toFixed(1)}% of ${formatCount(allVehicles)} vehicles · ` : ""}growth rate capped at 0% since February 2018`}
      label="Cars on the road"
      period={`31 December ${data.year}`}
      range={range}
      span={`${data.years.length}-year`}
    />
  );
}

/**
 * "Cars were 67.0% of the 984,763 vehicles on Singapore's roads at the end of
 * 2025, and their number grew 0.3% on 2024."
 */
async function PopulationLead() {
  const population = await loadPopulation();
  if (!population) {
    return null;
  }

  const { cars, classes, data } = population;
  const current = cars.series.at(-1) ?? 0;
  const previous = cars.series.at(-2);
  const allVehicles = classes.reduce((sum, row) => sum + row.population, 0);
  const change =
    previous && data.previousYear
      ? `, and their number ${current < previous ? "fell" : "grew"} ${Math.abs(((current - previous) / previous) * 100).toFixed(1)}% on ${data.previousYear}`
      : "";

  return (
    <Typography.Paragraph className="max-w-prose tabular-nums">
      Cars were {((current / (allVehicles || 1)) * 100).toFixed(1)}% of the{" "}
      {formatCount(allVehicles)} vehicles on Singapore's roads at the end of{" "}
      {data.year}
      {change}.
    </Typography.Paragraph>
  );
}

async function PopulationFuel() {
  const population = await loadPopulation();
  return population ? (
    <FuelSplit entity={population.cars} year={population.data.year} />
  ) : null;
}

/** Both figures, or the empty state while LTA has published nothing. */
async function PopulationFigures() {
  const population = await loadPopulation();

  if (!population) {
    return (
      <EmptyState className="rounded-3xl bg-default/50" size="lg">
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

  return (
    <>
      <PopulationByYear entity={cars} years={data.years} />

      <Hairline />

      <section className="flex scroll-mt-4 flex-col gap-6" id="vp-classes">
        <SectionHead
          caption={describeClasses(classes, cars, data.years, FLEET_YEARS)}
          eyebrow={`Figure 2 · ${data.year}`}
          title="All vehicle classes, and the electric fleet"
        />
        <OverviewGrid>
          <ClassesTable
            previousYear={data.previousYear}
            rows={classes}
            year={data.year}
          />
          <ElectricFleet entity={cars} years={data.years} />
        </OverviewGrid>
        <SourceNote>
          Source: LTA via DataMall · Annual vehicle population by class and
          electric cars on the road.
        </SourceNote>
      </section>
    </>
  );
}

/** The questions and their FAQPage schema, with the latest year end quoted. */
async function AnnualFaq() {
  const population = await loadPopulation();
  const faqs = buildAnnualFaqs(
    population
      ? summarisePopulation(population.cars, population.data.years)
      : undefined,
  );

  return (
    <>
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

      <OverviewPage className="gap-10 max-md:gap-7">
        {/* Direction D's head. Everything reads one cached query and no
            search params, so the whole page is part of the static shell. */}
        <HeadGrid
          keys={
            <KeysAside
              eyebrow="Cars by fuel type"
              jump={JUMP_LINKS}
              label="Cars by fuel type"
              source={
                <>
                  Share of cars on the road at <YearEnd />, by fuel type as LTA
                  records it.
                </>
              }
            >
              <SectionErrorBoundary title="Fuel split unavailable">
                <PopulationFuel />
              </SectionErrorBoundary>
            </KeysAside>
          }
        >
          <HeadTitle
            eyebrow={
              <>
                Vehicle population · <YearEnd />
              </>
            }
            title="Vehicle population"
          />
          <SectionErrorBoundary title="Vehicle population unavailable">
            <PopulationHero />
            <PopulationLead />
          </SectionErrorBoundary>
          <div>
            <SharePill title="Vehicle population" />
          </div>
          <SourceNote>
            Source: LTA via DataMall. Registered at <YearEnd />, counted once a
            year.
          </SourceNote>
        </HeadGrid>

        <Hairline />

        <SectionErrorBoundary title="Vehicle population unavailable">
          <PopulationFigures />
        </SectionErrorBoundary>

        <Hairline />

        <AnnualFaq />
      </OverviewPage>
    </>
  );
}
