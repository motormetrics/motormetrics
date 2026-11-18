import { Skeleton, Typography } from "@heroui/react";
import { ElectricFleet } from "@web/app/(main)/(dashboard)/cars/annual/components/electric-fleet";
import {
  buildPopulationSeries,
  CARS,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import {
  AdoptionByMonth,
  COLUMN_COUNT,
  loadShareWindow,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/adoption-by-month";
import { ChargingSummary } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/charging-summary";
import {
  ElectrifiedMix,
  MixCaption,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/electrified-total";
import {
  FuelTypeFilter,
  TrendRangeFilter,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-filters";
import {
  EvHero,
  EvKeyNumbers,
  EvLead,
  SelectedMonth,
  SelectedMonthName,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-head";
import {
  EvLeaderboard,
  loadEvMakes,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-leaderboard";
import {
  loadEvSelection,
  type SelectionProps,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import {
  summariseLeaderboard,
  yearToDateMakes,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import {
  chargingCaption,
  makesCaption,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-summary";
import { buildElectricVehiclesFaqs } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/faq-data";
import { RegistrationTrend } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/registration-trend";
import {
  VES_BANDS,
  VesBands,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ves-bands";
import { CHARGING_POINT_TARGET_2030 } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthSelect } from "@web/components/shared/month-select";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { FilterGroup, FiltersPanel } from "@web/components/shared/page-filters";
import { PageHead } from "@web/components/shared/page-head";
import {
  PageBody,
  RelatedLinks,
  ScopeControl,
} from "@web/components/shared/page-layout";
import { StructuredData } from "@web/components/structured-data";
import { EV_FUEL_TYPES, SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getFuelTypeData } from "@web/queries/cars";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { getEvChargingNetworkSummary } from "@web/queries/ev-charging";
import { getVehiclePopulationByCategoryAndFuelType } from "@web/queries/vehicle-population";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const metadata: Metadata = {
  title: "Electric Vehicles in Singapore",
  description:
    "Track Singapore's electric vehicle adoption with BEV, PHEV, and hybrid registration trends, market share analysis, and top EV makes.",
  openGraph: {
    ...baseOpenGraph,
    title: "Electric Vehicles - Singapore EV Trends",
    description:
      "Explore BEV, PHEV, and hybrid adoption trends, market share, and brand rankings in Singapore.",
    url: `${SITE_URL}/cars/electric-vehicles`,
  },
  twitter: {
    ...baseTwitter,
    title: "Electric Vehicles - Singapore EV Trends",
    description:
      "Explore BEV, PHEV, and hybrid adoption trends, market share, and brand rankings in Singapore.",
  },
  alternates: {
    canonical: "/cars/electric-vehicles",
  },
};

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Electric Vehicles",
  description:
    "Singapore electric vehicle adoption trends including BEV, PHEV, and hybrid registrations, market share analysis, and top EV makes",
  url: `${SITE_URL}/cars/electric-vehicles`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

interface PageProps {
  searchParams: Promise<SearchParams>;
}

/**
 * The questions and their FAQPage schema. Quotes the latest month's year to
 * date whatever month is selected, so it reads no search params.
 */
async function ElectricVehiclesFaq() {
  const [month, electric] = await Promise.all([
    getCarsLatestMonth(),
    getFuelTypeData(EV_FUEL_TYPES.BEV[0]),
  ]);
  const faqs = buildElectricVehiclesFaqs(
    month
      ? summariseLeaderboard(
          yearToDateMakes(electric.data, EV_FUEL_TYPES.BEV, month),
          month,
        )
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

async function MonthControl({ searchParams }: PageProps) {
  const { month: requestedMonth } = await loadSearchParams(searchParams);
  const [months, { month, wasAdjusted }] = await Promise.all([
    fetchMonthsForCars(),
    getMonthOrLatest(requestedMonth, "cars"),
  ]);

  if (months.length === 0) {
    return null;
  }

  return (
    <MonthSelect
      latestMonth={month}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}

async function MakesCaption({ selection }: SelectionProps) {
  const { month } = await selection;

  return makesCaption(await loadEvMakes(month), month, []);
}

async function ShareCaption({ selection }: SelectionProps) {
  const { month } = await selection;

  return makesCaption([], month, await loadShareWindow(month));
}

/**
 * Electric cars on the road at each of the last few year ends. Reads only the
 * cached population query, so it is part of the static shell.
 */
async function ElectricCarsOnTheRoad() {
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

  return data && cars ? (
    <ElectricFleet entity={cars} linked={false} years={data.years} />
  ) : null;
}

/** Reads only cached network data, so it is part of the static shell. */
async function ChargingCaption() {
  const network = await getEvChargingNetworkSummary();

  return chargingCaption(
    network.connectors,
    CHARGING_POINT_TARGET_2030,
    VES_BANDS[0].value,
  );
}

export default function ElectricVehiclesPage({ searchParams }: PageProps) {
  // Started once, awaited only by the parts that show figures.
  const selection = loadEvSelection(searchParams);

  const filters = (
    <>
      <FilterGroup label="Fuel type">
        <Suspense fallback={<Skeleton className="h-36 w-full" />}>
          <FuelTypeFilter />
        </Suspense>
      </FilterGroup>
      <FilterGroup label="Trend range">
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <TrendRangeFilter />
        </Suspense>
      </FilterGroup>
    </>
  );

  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Electric Vehicles", path: "/cars/electric-vehicles" },
          ]),
        }}
      />

      {/* The head carries the title, the month and Share. The month sets
          what the whole page reports on, so its select sits in the head; the
          fuel type and trend range narrow the trend, so they sit in the right
          sidebar, with a "Filters" button in the head where it does not fit. */}
      <PageHead
        controls={
          <ScopeControl label="Month">
            <Suspense fallback={<Skeleton className="h-10 w-40" />}>
              <MonthControl searchParams={searchParams} />
            </Suspense>
          </ScopeControl>
        }
        filters={filters}
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-32" />}>
            <SelectedMonth selection={selection} />
          </Suspense>
        }
        title="Electric vehicles"
      />

      <PageBody
        rail={
          <>
            <FiltersPanel>{filters}</FiltersPanel>
            <SectionErrorBoundary title="Key numbers unavailable">
              <EvKeyNumbers selection={selection} />
            </SectionErrorBoundary>
          </>
        }
      >
        <section className="flex flex-col gap-4">
          <SectionErrorBoundary title="Electric share unavailable">
            <EvHero selection={selection} />
          </SectionErrorBoundary>
          <Typography.Paragraph className="max-w-prose tabular-nums">
            <Suspense fallback={<Skeleton className="h-12 w-full" />}>
              <EvLead selection={selection} />
            </Suspense>
          </Typography.Paragraph>
          <Typography.Paragraph color="muted" size="sm">
            New car registrations. Electric means battery-electric cars only.
            Source: LTA via DataMall.
          </Typography.Paragraph>
        </section>

        <Hairline />

        <SectionErrorBoundary title="Registration trend unavailable">
          <RegistrationTrend selection={selection} />
        </SectionErrorBoundary>

        <Hairline />

        <section className="flex scroll-mt-4 flex-col gap-4" id="ev-mix">
          <SectionHead
            caption={
              <Suspense fallback=" ">
                <MixCaption selection={selection} />
              </Suspense>
            }
            eyebrow={
              <>
                Figure 2 ·{" "}
                <Suspense fallback=" ">
                  <SelectedMonth selection={selection} />
                </Suspense>
              </>
            }
            title="New cars by fuel type"
          />
          <SectionErrorBoundary title="Fuel type split unavailable">
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <ElectrifiedMix selection={selection} />
            </Suspense>
          </SectionErrorBoundary>
          <SourceNote>
            Source: LTA via DataMall · Shares are of the month&apos;s new cars.
            Fuel types are LTA&apos;s, with each diesel version grouped with its
            petrol one.
          </SourceNote>
        </section>

        <Hairline />

        <section className="flex scroll-mt-4 flex-col gap-4" id="ev-makes">
          <SectionHead
            caption={
              <Suspense fallback=" ">
                <MakesCaption selection={selection} />
              </Suspense>
            }
            eyebrow={
              <>
                Figure 3 · January to{" "}
                <Suspense fallback=" ">
                  <SelectedMonth selection={selection} />
                </Suspense>
              </>
            }
            link={{ href: "/cars/makes", label: "All makes" }}
            title="Leading electric makes"
          />
          <SectionErrorBoundary title="Leading electric makes unavailable">
            <EvLeaderboard selection={selection} />
          </SectionErrorBoundary>
          <SourceNote>
            Source: LTA via DataMall · Year to date, from January to the
            selected month. The six makes with the most new electric cars.
          </SourceNote>
        </section>

        <Hairline />

        <div className="scroll-mt-4" id="ev-road">
          <SectionErrorBoundary title="Electric cars on the road unavailable">
            <ElectricCarsOnTheRoad />
          </SectionErrorBoundary>
        </div>
      </PageBody>

      {/* Sections the artboard does not draw sit below the two columns, so
          that on a narrow screen the key figures come before them. */}
      <PageBody>
        <Hairline />

        <section className="flex scroll-mt-4 flex-col gap-4" id="ev-share">
          <SectionHead
            caption={
              <Suspense fallback=" ">
                <ShareCaption selection={selection} />
              </Suspense>
            }
            eyebrow={
              <>
                Figure 4 · {COLUMN_COUNT} months to{" "}
                <Suspense fallback=" ">
                  <SelectedMonthName selection={selection} />
                </Suspense>
              </>
            }
            title="Electric share of new cars by month"
          />
          <SectionErrorBoundary title="Electric share by month unavailable">
            <AdoptionByMonth selection={selection} />
          </SectionErrorBoundary>
          <SourceNote>
            Source: LTA via DataMall · Electric cars as a share of each
            month&apos;s new cars. Y-axis starts at zero. Select a month to move
            the page to it.
          </SourceNote>
        </section>

        <Hairline />

        <section className="flex scroll-mt-4 flex-col gap-6" id="ev-charging">
          <SectionHead
            caption={<ChargingCaption />}
            eyebrow="Figure 5 · Infrastructure and incentives"
            title="Charging network and VES bands"
          />
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <SectionErrorBoundary title="Charging network unavailable">
              <ChargingSummary />
            </SectionErrorBoundary>
            <VesBands />
          </div>
          <SourceNote>Source: LTA; LTA DataMall EV Charging Points.</SourceNote>
        </section>

        <Hairline />

        <ElectricVehiclesFaq />
      </PageBody>

      <RelatedLinks
        links={[
          { href: "/cars", label: "New registrations" },
          { href: "/cars/makes", label: "Makes" },
          { href: "/cars/annual", label: "Vehicle population" },
        ]}
      />
    </OverviewPage>
  );
}
