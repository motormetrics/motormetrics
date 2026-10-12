import { Skeleton } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { FUEL_TYPES_FAQS } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/faq-data";
import { FuelTypesReport } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-report";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthMenu } from "@web/components/shared/month-menu";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

const title = "Fuel types";
const description =
  "Comprehensive overview of all fuel types in {month} Singapore car registrations. Compare petrol, diesel, electric and petrol-electric registrations.";
const canonical = "/cars/fuel-types";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");
  const formattedMonth = formatDateToMonthYear(month);

  const metaTitle = "Car Registrations by Fuel Type";
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
          <Suspense fallback={<Skeleton className="h-8 w-36" />}>
            <FuelTypesMonthPicker searchParams={searchParams} />
          </Suspense>
        }
        eyebrow="Cars"
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-72" />}>
            <FuelTypesMonthSub searchParams={searchParams} />
          </Suspense>
        }
        title={title}
      />

      <SectionErrorBoundary title="Fuel types unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <FuelTypesStructuredData searchParams={searchParams} />
          <FuelTypesReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: FUEL_TYPES_FAQS }]),
        }}
      />
      <PageFaq faqs={FUEL_TYPES_FAQS} />
    </OverviewPage>
  );
}

/** Names what the page counts, the month it reports and its source. */
async function FuelTypesMonthSub({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  return (
    <>
      The fuel types behind each month's new car registrations ·{" "}
      <span className="font-semibold text-foreground">
        {formatMonthLabel(month)}
      </span>{" "}
      · Source: LTA via DataMall
    </>
  );
}

async function FuelTypesMonthPicker({
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

async function FuelTypesStructuredData({
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
