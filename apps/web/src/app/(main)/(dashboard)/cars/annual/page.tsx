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
  CountRangeHero,
  changeLabel,
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
import { PageHead } from "@web/components/shared/page-head";
import { PageBody, RelatedLinks } from "@web/components/shared/page-layout";
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

/**
 * Worded for what people search ("how many cars are there in Singapore"),
 * which this page ranks for but did not win clicks on as "Annual Vehicle
 * Population". The title stays evergreen; the description quotes the latest
 * year-end count so the snippet answers before the click.
 */
const title = "How Many Cars Are There in Singapore?";
const fallbackDescription =
  "Singapore's car and vehicle population at each year end, by vehicle type and fuel type, from LTA.";

export async function generateMetadata(): Promise<Metadata> {
  const population = await loadPopulation();
  let description = fallbackDescription;
  if (population) {
    const { cars, classes, data } = population;
    const allVehicles = classes.reduce((sum, row) => sum + row.population, 0);
    description = `Singapore had ${formatCount(cars.series.at(-1) ?? 0)} cars on the road at the end of ${data.year}, out of ${formatCount(allVehicles)} vehicles. Car and vehicle population by year, type and fuel, from LTA.`;
  }

  return {
    title,
    description,
    openGraph: {
      ...baseOpenGraph,
      title: `${title} - Car Population`,
      description,
      url: `${SITE_URL}/cars/annual`,
    },
    alternates: {
      canonical: "/cars/annual",
    },
  };
}

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description: fallbackDescription,
  url: `${SITE_URL}/cars/annual`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

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
    <CountRangeHero
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

/** Both figures, or the empty state while LTA has published nothing. */
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

  return (
    <>
      <PopulationByYear entity={cars} years={data.years} />

      <Hairline />

      <section className="flex scroll-mt-4 flex-col gap-6" id="vp-classes">
        <SectionHead
          caption={describeClasses(classes, cars, data.years, FLEET_YEARS)}
          eyebrow={`Figure 2 · ${data.year}`}
          title="All vehicles by type, and cars by fuel type"
        />
        <OverviewGrid>
          <ClassesTable
            previousYear={data.previousYear}
            rows={classes}
            year={data.year}
          />
          <section className="flex min-w-0 flex-col gap-4">
            <SectionHead
              caption={`Share of cars on the road at 31 December ${data.year}, by fuel type as LTA records it`}
              title="Cars by fuel type"
            />
            <FuelSplit entity={cars} year={data.year} />
          </section>
        </OverviewGrid>
        <SourceNote>
          Source: LTA via DataMall · Annual vehicle population by type and by
          fuel type.
        </SourceNote>
      </section>

      <Hairline />

      <div className="scroll-mt-4" id="vp-electric">
        <ElectricFleet entity={cars} years={data.years} />
      </div>
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

      <OverviewPage className="gap-8 max-md:gap-6">
        {/* Everything reads one cached query and no search params, so the
            whole page is part of the static shell. There is nothing to
            filter, so the page has no right sidebar. */}
        <PageHead sub={<YearEnd />} title="Vehicle population" />

        <PageBody>
          <section className="flex flex-col gap-4">
            <SectionErrorBoundary title="Vehicle population unavailable">
              <PopulationHero />
              <PopulationLead />
            </SectionErrorBoundary>
            <SourceNote>
              Source: LTA via DataMall. Registered at <YearEnd />, counted once
              a year.
            </SourceNote>
          </section>

          <Hairline />

          <SectionErrorBoundary title="Vehicle population unavailable">
            <PopulationFigures />
          </SectionErrorBoundary>

          <Hairline />

          <AnnualFaq />
        </PageBody>

        <RelatedLinks
          links={[
            { href: "/cars", label: "New registrations" },
            { href: "/cars/deregistrations", label: "Deregistrations" },
            { href: "/cars/makes", label: "Makes" },
          ]}
        />
      </OverviewPage>
    </>
  );
}
