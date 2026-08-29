import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  type CategoryConfig,
  CategoryReport,
} from "@web/app/(main)/(dashboard)/cars/components/category/category-report";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthSelector } from "@web/components/shared/month-selector";
import { PageHead } from "@web/components/shared/page-head";
import { Report } from "@web/components/shared/report";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

export type { CategoryConfig };

/**
 * The shared body of `/cars/fuel-types` and `/cars/vehicle-types`.
 *
 * Both routes are the same report over a different `cars` column, so the page
 * files supply a `CategoryConfig` and nothing else. This is a report-family
 * page: `Report` narrows the whole shell to the comps' 1240px measure, and the
 * blocks beneath it are hairline-ruled rather than carded.
 */
export function CategoryOverview({
  config,
  searchParams,
}: {
  config: CategoryConfig;
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Report>
      <PageHead
        controls={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <CategoryOverviewHeaderMeta searchParams={searchParams} />
          </Suspense>
        }
        description={config.lede}
        title={config.title}
      />

      <SectionErrorBoundary title={`${config.title} unavailable`}>
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <CategoryStructuredData config={config} searchParams={searchParams} />
          <CategoryReport config={config} searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </Report>
  );
}

async function CategoryOverviewHeaderMeta({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);

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

async function CategoryStructuredData({
  config,
  searchParams,
}: {
  config: CategoryConfig;
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");
  const formattedMonth = formatDateToMonthYear(month);

  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${formattedMonth} ${config.title}`,
    description: config.description.replace("{month}", formattedMonth),
    url: `${SITE_URL}${config.urlPath}`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };

  return <StructuredData data={structuredData} />;
}
