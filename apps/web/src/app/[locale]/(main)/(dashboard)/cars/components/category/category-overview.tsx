import { formatDateToMonthYear } from "@motormetrics/utils";
import { loadSearchParams } from "@web/app/[locale]/(main)/(dashboard)/cars/registrations/search-params";
import { AnimatedSection } from "@web/app/[locale]/(main)/(dashboard)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageMeta } from "@web/components/dashboard-page-meta";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { MonthSelector } from "@web/components/shared/month-selector";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import Typography from "@web/components/typography";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { loadCarsCategoryPageData } from "@web/lib/cars/page-data";
import { loadLastUpdated } from "@web/lib/common";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";
import { CategoryInsightsCard } from "./category-insights-card";
import { CategoryTabsPanel } from "./category-tabs-panel";

export interface CategoryConfig {
  title: string;
  apiDataField: "fuelType" | "vehicleType";
  tabTitle: string;
  description: string;
  urlPath: string;
}

interface CategoryOverviewProps {
  config: CategoryConfig;
  searchParams: Promise<SearchParams>;
}

export function CategoryOverview({
  config,
  searchParams,
}: CategoryOverviewProps) {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title={
          <DashboardPageTitle
            title={config.title}
            subtitle={`Breakdown of registrations by ${config.tabTitle.toLowerCase()} for the selected month.`}
          />
        }
        meta={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <CategoryOverviewHeaderMeta searchParams={searchParams} />
          </Suspense>
        }
      />

      <Suspense fallback={<SkeletonCard className="h-[720px] w-full" />}>
        <CategoryOverviewContent config={config} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CategoryOverviewHeaderMeta({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParamsPromise);

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

async function CategoryOverviewContent({
  config,
  searchParams: searchParamsPromise,
}: {
  config: CategoryConfig;
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParamsPromise);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  const { cars, marketShare, previousTotal, topMakesByFuelType } =
    await loadCarsCategoryPageData(month, config.apiDataField);

  const categoryData = cars?.[config.apiDataField] || [];

  const formattedMonth = formatDateToMonthYear(month);
  const title = `${formattedMonth} ${config.title}`;
  const description = config.description.replace("{month}", formattedMonth);

  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}${config.urlPath}`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />
      {categoryData.length > 0 ? (
        <>
          <AnimatedSection order={1}>
            <Suspense fallback={<SkeletonCard className="h-[300px] w-full" />}>
              <CategoryInsightsCard
                categoriesCount={categoryData.length}
                previousTotal={previousTotal}
                topPerformer={marketShare.dominantType}
                month={month}
                title={config.tabTitle}
                total={cars.total}
              />
            </Suspense>
          </AnimatedSection>
          <AnimatedSection order={2}>
            <Suspense fallback={<SkeletonCard className="h-[620px] w-full" />}>
              <CategoryTabsPanel
                types={categoryData}
                month={month}
                title={config.tabTitle}
                totalRegistrations={cars.total}
                topMakesByFuelType={topMakesByFuelType}
              />
            </Suspense>
          </AnimatedSection>
        </>
      ) : (
        <div className="py-8 text-center">
          <Typography.Text>
            No {config.title.toLowerCase()} data available for {formattedMonth}
          </Typography.Text>
        </div>
      )}
    </>
  );
}
