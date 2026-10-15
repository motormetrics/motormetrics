import { Skeleton } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/search-params";
import { VEHICLE_TYPES_FAQS } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/faq-data";
import { PeriodSegment } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-filters";
import {
  loadVehicleTypesSearchParams,
  periodLabelFor,
  VehicleTypesReport,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-report";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthMenu } from "@web/components/shared/month-menu";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

const title = "Vehicle types";
const description =
  "Comprehensive overview of all vehicle types in {month} Singapore car registrations. Compare sedans, hatchbacks, SUVs, MPVs and station-wagons.";
const canonical = "/cars/vehicle-types";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");
  const formattedMonth = formatDateToMonthYear(month);

  const metaTitle = "Car Registrations by Vehicle Type";
  const metaDescription = description.replace("{month}", formattedMonth);

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      ...baseOpenGraph,
      title: metaTitle,
      description: metaDescription,
      url: `${SITE_URL}${canonical}`,
    },
    twitter: {
      ...baseTwitter,
      title: metaTitle,
      description: metaDescription,
    },
    alternates: {
      canonical,
    },
  };
}

export default function Page({ searchParams }: PageProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <PageHead
        controls={
          <>
            {/* nuqs reads the URL on the client, so the segment needs its own
                boundary to keep the static shell. */}
            <Suspense fallback={<Skeleton className="h-8 w-48" />}>
              <PeriodSegment />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-8 w-36" />}>
              <VehicleTypesMonthPicker searchParams={searchParams} />
            </Suspense>
          </>
        }
        eyebrow="Cars"
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-72" />}>
            <VehicleTypesMonthSub searchParams={searchParams} />
          </Suspense>
        }
        title={title}
      />

      <SectionErrorBoundary title="Vehicle types unavailable">
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          }
        >
          <VehicleTypesStructuredData searchParams={searchParams} />
          <VehicleTypesReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: VEHICLE_TYPES_FAQS }]),
        }}
      />
      <PageFaq faqs={VEHICLE_TYPES_FAQS} />
    </OverviewPage>
  );
}

/** Names the period the page reports, what it counts and its source. */
async function VehicleTypesMonthSub({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth, period } =
    await loadVehicleTypesSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  return (
    <>
      <span className="font-semibold text-foreground">
        {periodLabelFor(period, month)}
      </span>{" "}
      · the vehicle types behind new car registrations · Source: LTA via
      DataMall
    </>
  );
}

async function VehicleTypesMonthPicker({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);

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

async function VehicleTypesStructuredData({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");
  const formattedMonth = formatDateToMonthYear(month);

  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${formattedMonth} ${title}`,
    description: description.replace("{month}", formattedMonth),
    url: `${SITE_URL}${canonical}`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };

  return <StructuredData data={structuredData} />;
}
