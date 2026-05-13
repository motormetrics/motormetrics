import { redis } from "@motormetrics/utils";
import { ComparisonMixedChart } from "@web/app/(main)/(dashboard)/coe/components/pqp/comparison-mixed-chart";
import { ComparisonSummaryCard } from "@web/app/(main)/(dashboard)/coe/components/pqp/comparison-summary-card";
import { DataTable } from "@web/app/(main)/(dashboard)/coe/components/pqp/data-table";
import { IndependentCategorySection } from "@web/app/(main)/(dashboard)/coe/components/pqp/independent-category-section";
import { RenewalComparison } from "@web/app/(main)/(dashboard)/coe/components/pqp/renewal-comparison";
import { PqpSecondaryDisclosure } from "@web/app/(main)/(dashboard)/coe/components/pqp/secondary-disclosure";
import { TrendsChart } from "@web/app/(main)/(dashboard)/coe/components/pqp/trends-chart";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageMeta } from "@web/components/dashboard-page-meta";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { MonthSelector } from "@web/components/shared/month-selector";
import { StructuredData } from "@web/components/structured-data";
import { UnreleasedFeature } from "@web/components/unreleased-feature";
import { LAST_UPDATED_COE_KEY, SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import { getPQPOverview } from "@web/queries/coe";
import type { Pqp } from "@web/types/coe";
import { fetchMonthsForCOE, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";
import { loadSearchParams } from "./search-params";

const title = "PQP Rates for COE Renewal";
const description =
  "Latest Prevailing Quota Premium (PQP) rates for COE renewal in Singapore. These rates show the average COE prices over the last 3 months.";
const images = `${SITE_URL}/opengraph-image.png`;
const primaryCategories = ["Category A", "Category B"] satisfies Array<
  keyof Pqp.Rates
>;
type SecondaryCategory = keyof Pick<Pqp.Rates, "Category C" | "Category D">;
const secondaryCategoryGroups = [
  ["Category C"],
  ["Category D"],
] satisfies Array<[SecondaryCategory]>;

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/coe/pqp`,
    siteName: SITE_TITLE,
    locale: "en_SG",
    type: "website",
    images,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    site: SOCIAL_HANDLE,
    creator: SOCIAL_HANDLE,
    images,
  },
  alternates: {
    canonical: "/coe/pqp",
  },
};

export default async function PQPRatesPage({
  searchParams: searchParamsPromise,
}: PageProps) {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title={
          <DashboardPageTitle
            title="PQP Rates"
            subtitle="Renewal-focused view of Prevailing Quota Premium rates and latest COE bidding signals."
          />
        }
        meta={
          <Suspense>
            <PQPRatesHeaderMeta searchParams={searchParamsPromise} />
          </Suspense>
        }
      />
      <Suspense>
        <PQPRatesContent />
      </Suspense>
    </div>
  );
}

async function PQPRatesHeaderMeta({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParamsPromise);
  const [months, lastUpdated] = await Promise.all([
    fetchMonthsForCOE(),
    redis.get<number>(LAST_UPDATED_COE_KEY),
  ]);
  const { wasAdjusted } = await getMonthOrLatest(parsedMonth, "coe");

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

async function PQPRatesContent() {
  const overview = await getPQPOverview();

  const primaryColumns = getPqpColumns(primaryCategories);
  const primaryComparison = filterByCategories(
    overview.comparison,
    primaryCategories,
  );
  const primaryCategorySummaries = filterByCategories(
    overview.categorySummaries,
    primaryCategories,
  );
  const secondaryCategorySections = secondaryCategoryGroups.map(
    (categories) => ({
      category: categories[0],
      categorySummaries: filterByCategories(
        overview.categorySummaries,
        categories,
      ),
      columns: getPqpColumns(categories),
      key: categories.join("-"),
    }),
  );

  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}/coe/pqp`,
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDatasetSchema("coe-pqp"),
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "COE", path: "/coe" },
            { name: "PQP", path: "/coe/pqp" },
          ]),
        }}
      />
      <div className="flex flex-col gap-8">
        <AnimatedSection order={1}>
          <Suspense>
            <ComparisonSummaryCard data={primaryComparison} />
          </Suspense>
        </AnimatedSection>

        <AnimatedSection order={2}>
          <Suspense>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TrendsChart
                categories={primaryCategories}
                data={overview.trendData}
              />
              <ComparisonMixedChart data={primaryComparison} />
            </div>
          </Suspense>
        </AnimatedSection>

        <AnimatedSection order={3}>
          <Suspense>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)] xl:items-start">
              <DataTable rows={overview.tableRows} columns={primaryColumns} />
              <UnreleasedFeature>
                <RenewalComparison
                  categories={primaryCategories}
                  data={primaryCategorySummaries}
                />
              </UnreleasedFeature>
            </div>
          </Suspense>
        </AnimatedSection>

        <AnimatedSection order={5}>
          <Suspense>
            <PqpSecondaryDisclosure>
              {secondaryCategorySections.map(
                ({ category, categorySummaries, columns, key }) => (
                  <IndependentCategorySection
                    key={key}
                    category={category}
                    columns={columns}
                    summary={categorySummaries[0]}
                    tableRows={overview.tableRows}
                    trendData={overview.trendData}
                  />
                ),
              )}
            </PqpSecondaryDisclosure>
          </Suspense>
        </AnimatedSection>
      </div>
    </>
  );
}

function getPqpColumns(categories: Array<keyof Pqp.Rates>): Pqp.TableColumn[] {
  return [
    { key: "month", label: "Month", sortable: true },
    ...categories.map((category) => ({ key: category, label: category })),
  ];
}

function filterByCategories<T extends { category: string }>(
  data: T[],
  categories: Array<keyof Pqp.Rates>,
) {
  const categorySet = new Set<string>(categories);

  return data.filter((item) => categorySet.has(item.category));
}
