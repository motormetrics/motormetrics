import { Card, Chip, Link } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { CarOverviewTrends } from "@web/app/(main)/(explore)/cars/registrations/components/overview-trends";
import { AnimatedNumber } from "@web/components/animated-number";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageMeta } from "@web/components/dashboard-page-meta";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { MonthSelector } from "@web/components/shared/month-selector";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import Typography from "@web/components/typography";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { loadCarsTypePageData } from "@web/lib/cars/page-data";
import { loadLastUpdated } from "@web/lib/common";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import {
  checkFuelTypeIfExist,
  checkVehicleTypeIfExist,
} from "@web/queries/cars";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { createLoader, parseAsString } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const typeSearchParams = { month: parseAsString };
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

export async function TypeDetail({
  config,
  params,
  searchParams,
}: TypeDetailProps) {
  const { type } = await params;
  const displayName =
    config.category === "fuel-types"
      ? (await checkFuelTypeIfExist(type))?.fuelType
      : (await checkVehicleTypeIfExist(type))?.vehicleType;
  const categoryLabel =
    config.category === "fuel-types" ? "Fuel Type" : "Vehicle Type";

  return (
    <div className="flex flex-col gap-4">
      <DashboardPageHeader
        meta={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <TypeDetailHeaderMeta searchParams={searchParams} />
          </Suspense>
        }
        title={
          <DashboardPageTitle
            title={displayName ?? "Type Overview"}
            subtitle={`Registration trends and monthly statistics by ${categoryLabel.toLowerCase()} in Singapore.`}
          />
        }
      />

      <Suspense fallback={<SkeletonCard className="h-[520px] w-full" />}>
        <TypeDetailContent
          config={config}
          params={params}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
}

async function TypeDetailHeaderMeta({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } =
    await loadTypeSearchParams(searchParamsPromise);

  const [{ wasAdjusted }, months, lastUpdated] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    fetchMonthsForCars(),
    loadLastUpdated("cars"),
  ]);

  return (
    <DashboardPageMeta lastUpdated={lastUpdated}>
      <MonthSelector
        months={months}
        latestMonth={months[0]}
        wasAdjusted={wasAdjusted}
      />
    </DashboardPageMeta>
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
  const [{ type }, { month: parsedMonth }] = await Promise.all([
    paramsPromise,
    loadTypeSearchParams(searchParamsPromise),
  ]);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  const typeExists =
    config.category === "fuel-types"
      ? await checkFuelTypeIfExist(type)
      : await checkVehicleTypeIfExist(type);
  if (!typeExists) {
    notFound();
  }

  const { cars } = await loadCarsTypePageData(config.category, type, month);
  const displayName =
    config.category === "fuel-types"
      ? ((await checkFuelTypeIfExist(type))?.fuelType ?? type)
      : ((await checkVehicleTypeIfExist(type))?.vehicleType ?? type);
  const categoryLabel =
    config.category === "fuel-types" ? "fuel type" : "vehicle type";
  const title = `${displayName} Cars in Singapore`;
  const description = `${displayName} car registrations in Singapore. Explore registration trends, statistics, and distribution by ${categoryLabel} for each month.`;
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

  const formattedMonth = formatDateToMonthYear(month);

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
              name:
                config.category === "fuel-types"
                  ? "Fuel Types"
                  : "Vehicle Types",
              path: `/cars/${config.category}`,
            },
            { name: type, path: `/cars/${config.category}/${type}` },
          ]),
        }}
      />

      <Typography.Text>
        {cars.total > 0
          ? `${displayName} vehicles accounted for ${cars.total.toLocaleString()} registrations in ${formattedMonth}.`
          : `No ${displayName} vehicle registrations were recorded in ${formattedMonth}.`}{" "}
        <Link
          href={`/cars/${config.category}`}
          className="text-primary hover:underline"
        >
          View all{" "}
          {config.category === "fuel-types" ? "fuel types" : "vehicle types"}{" "}
          &rarr;
        </Link>
      </Typography.Text>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="bg-surface p-4">
            <Card.Header className="flex flex-row items-center justify-between gap-2">
              <Typography.H4>Registrations</Typography.H4>
              <Chip size="sm" variant="soft">
                {formattedMonth}
              </Chip>
            </Card.Header>
            <Card.Content className="font-bold text-4xl text-primary">
              <AnimatedNumber value={cars.total} />
            </Card.Content>
          </Card>
        </div>
      </div>
      <CarOverviewTrends cars={cars.data} total={cars.total} />
    </>
  );
}
