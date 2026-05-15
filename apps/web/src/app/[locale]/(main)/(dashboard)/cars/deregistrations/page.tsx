import { KPI, KPIGroup, NumberValue } from "@heroui-pro/react";
import type { SelectDeregistration } from "@motormetrics/database";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { CategoryBreakdown } from "@web/app/[locale]/(main)/(dashboard)/cars/deregistrations/components/category-breakdown";
import { CategoryChart } from "@web/app/[locale]/(main)/(dashboard)/cars/deregistrations/components/category-chart";
import { CategoryTrendsTable } from "@web/app/[locale]/(main)/(dashboard)/cars/deregistrations/components/category-trends-table";
import { toPercentageDistribution } from "@web/app/[locale]/(main)/(dashboard)/cars/deregistrations/components/constants";
import { TrendsChart } from "@web/app/[locale]/(main)/(dashboard)/cars/deregistrations/components/trends-chart";
import {
  deregistrationsSearchParams,
  loadSearchParams,
} from "@web/app/[locale]/(main)/(dashboard)/cars/deregistrations/search-params";
import { AnimatedSection } from "@web/app/[locale]/(main)/(dashboard)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageMeta } from "@web/components/dashboard-page-meta";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { MonthSelector } from "@web/components/shared/month-selector";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import Typography from "@web/components/typography";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import {
  getDeregistrations,
  getDeregistrationsByCategory,
  getDeregistrationsTotalByMonth,
} from "@web/queries/deregistrations";
import {
  fetchMonthsForDeregistrations,
  getMonthOrLatest,
} from "@web/utils/dates/months";
import type { Metadata } from "next";
import { createSerializer, type SearchParams } from "nuqs/server";
import { Fragment, Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

const _serialize = createSerializer(deregistrationsSearchParams);

// Data transformation functions
const SPARKLINE_MONTH_COUNT = 12;

interface MonthlyTotal {
  month: string;
  total: number;
}

const toMonthlyTotals = (data: SelectDeregistration[]): MonthlyTotal[] => {
  const grouped = data.reduce<Record<string, number>>((acc, record) => {
    acc[record.month] = (acc[record.month] ?? 0) + (record.number ?? 0);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

interface CategorySparklineData {
  category: string;
  total: number;
  trend: { value: number }[];
  colour: string;
}

const toCategorySparklines = (
  data: SelectDeregistration[],
  currentMonthCategories: { category: string; total: number }[],
  monthCount = SPARKLINE_MONTH_COUNT,
): CategorySparklineData[] => {
  const sortedMonths = [...new Set(data.map((record) => record.month))].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  const recentMonths = sortedMonths.slice(-monthCount);

  return currentMonthCategories.map(({ category, total }, index) => {
    const trend = recentMonths.map((month) => {
      const monthRecords = data.filter(
        (record) => record.month === month && record.category === category,
      );
      const value = monthRecords.reduce(
        (sum, record) => sum + (record.number ?? 0),
        0,
      );
      return { value };
    });

    return {
      category,
      total,
      trend,
      colour: `var(--chart-${index + 1})`,
    };
  });
};

const title = "Vehicle Deregistrations";
const description =
  "Monthly vehicle deregistration statistics in Singapore under the Vehicle Quota System (VQS). Track deregistration trends by category.";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { month: parsedMonth } = await loadSearchParams(searchParams);

  const makeMetadata = (pageTitle: string, canonical: string): Metadata => ({
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_TITLE,
      locale: "en_SG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      site: SOCIAL_HANDLE,
      creator: SOCIAL_HANDLE,
    },
    alternates: { canonical },
    authors: [{ name: SITE_TITLE, url: SITE_URL }],
    creator: SITE_TITLE,
    publisher: SITE_TITLE,
  });

  try {
    const { month } = await getMonthOrLatest(parsedMonth, "deregistrations");
    const formattedMonth = formatDateToMonthYear(month);
    return makeMetadata(
      `${formattedMonth} ${title}`,
      `/cars/deregistrations?month=${month}`,
    );
  } catch {
    return makeMetadata(title, "/cars/deregistrations");
  }
}

export default function DeregistrationsPage({ searchParams }: PageProps) {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title={
          <DashboardPageTitle
            title="Vehicle Deregistrations"
            subtitle="Monthly vehicle deregistrations and scrapping trends in Singapore."
          />
        }
        meta={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <DeregistrationsHeaderMeta searchParams={searchParams} />
          </Suspense>
        }
      />
      <Suspense fallback={<SkeletonCard className="h-[860px] w-full" />}>
        <DeregistrationsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DeregistrationsHeaderMeta({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  try {
    const { month: parsedMonth } = await loadSearchParams(searchParamsPromise);
    const months = await fetchMonthsForDeregistrations();
    const { wasAdjusted } = await getMonthOrLatest(
      parsedMonth,
      "deregistrations",
    );

    return (
      <DashboardPageMeta>
        <MonthSelector
          months={months}
          latestMonth={months[0]}
          wasAdjusted={wasAdjusted}
        />
      </DashboardPageMeta>
    );
  } catch {
    return null;
  }
}

async function DeregistrationsContent({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParamsPromise);
  let months: string[] = [];
  let month: string;

  try {
    months = await fetchMonthsForDeregistrations();
    const result = await getMonthOrLatest(parsedMonth, "deregistrations");
    month = result.month;
  } catch {
    return <Typography.Text>No deregistration data available.</Typography.Text>;
  }

  const [categories, allDeregistrations] = await Promise.all([
    getDeregistrationsByCategory(month),
    getDeregistrations(),
  ]);

  const totalDeregistrations = categories.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const trendsData = toMonthlyTotals(allDeregistrations);
  const categoryCardsData = toCategorySparklines(
    allDeregistrations,
    categories,
  );
  const categoryBreakdownData = toPercentageDistribution(categories);

  // Get previous month total for comparison
  const currentMonthIndex = months.indexOf(month);
  const previousMonth =
    currentMonthIndex >= 0 && currentMonthIndex < months.length - 1
      ? months[currentMonthIndex + 1]
      : null;
  const previousMonthResult = previousMonth
    ? await getDeregistrationsTotalByMonth(previousMonth)
    : null;
  const previousMonthTotal = previousMonthResult?.[0]?.total;

  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}/cars/deregistrations`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };

  const previousTotal = previousMonthTotal ?? totalDeregistrations;

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDatasetSchema("deregistrations"),
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Deregistrations", path: "/cars/deregistrations" },
          ]),
        }}
      />
      {/* Interactive Category Chart */}
      <AnimatedSection order={2}>
        <Suspense fallback={<SkeletonCard className="h-[520px] w-full" />}>
          <CategoryChart data={allDeregistrations} months={months} />
        </Suspense>
      </AnimatedSection>

      {/* Metrics Bar - All in one row */}
      <AnimatedSection order={3}>
        <section>
          <KPIGroup>
            <KPI>
              <KPI.Header>
                <KPI.Title>Total</KPI.Title>
              </KPI.Header>
              <KPI.Content>
                <KPI.Value
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={totalDeregistrations}
                />
              </KPI.Content>
              {previousMonthTotal !== undefined ? (
                <KPI.Footer>
                  <span
                    className={`text-xs ${totalDeregistrations > previousTotal ? "text-danger" : "text-success"}`}
                  >
                    {totalDeregistrations > previousTotal ? "▲" : "▼"}{" "}
                    <NumberValue
                      locale="en-SG"
                      maximumFractionDigits={0}
                      value={Math.abs(totalDeregistrations - previousTotal)}
                    />
                  </span>
                </KPI.Footer>
              ) : null}
            </KPI>

            {categoryCardsData.map((cat) => (
              <Fragment key={cat.category}>
                <KPIGroup.Separator />
                <KPI>
                  <KPI.Header>
                    <KPI.Title>
                      {cat.category
                        .replace("Category ", "Cat ")
                        .replace("Vehicles Exempted From VQS", "VQS")}
                    </KPI.Title>
                  </KPI.Header>
                  <KPI.Content>
                    <KPI.Value
                      locale="en-SG"
                      maximumFractionDigits={0}
                      value={cat.total}
                    />
                  </KPI.Content>
                  <KPI.Footer>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 w-8 rounded-full"
                        style={{ backgroundColor: cat.colour }}
                      />
                      <span className="text-muted text-xs">
                        <NumberValue
                          maximumFractionDigits={0}
                          style="percent"
                          value={cat.total / totalDeregistrations}
                        />
                      </span>
                    </div>
                  </KPI.Footer>
                </KPI>
              </Fragment>
            ))}
          </KPIGroup>
        </section>
      </AnimatedSection>

      {/* Charts - Side by side on desktop */}
      <AnimatedSection order={4}>
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Trends Chart - Larger */}
          <div className="lg:col-span-2">
            <Suspense fallback={<SkeletonCard className="h-[360px] w-full" />}>
              <TrendsChart data={trendsData} />
            </Suspense>
          </div>

          {/* Category Breakdown - Compact */}
          <div className="lg:col-span-1">
            <Suspense fallback={<SkeletonCard className="h-[360px] w-full" />}>
              <CategoryBreakdown data={categoryBreakdownData} />
            </Suspense>
          </div>
        </section>
      </AnimatedSection>

      {/* Sparklines Table */}
      <AnimatedSection order={5}>
        <Suspense fallback={<SkeletonCard className="h-[300px] w-full" />}>
          <CategoryTrendsTable data={categoryCardsData} />
        </Suspense>
      </AnimatedSection>
    </>
  );
}
