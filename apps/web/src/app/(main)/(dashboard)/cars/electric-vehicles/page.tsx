// TODO: Add "Last updated" date
import { AdoptionTrendChart } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/adoption-trend-chart";
import { EvMetrics } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-metrics";
import { MakeTable } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/make-table";
import { MarketShareChart } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/market-share-chart";
import { TopMakesChart } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/top-makes-chart";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { EmptyState } from "@web/components/shared/empty-state";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import {
  getEvLatestSummary,
  getEvMakeDetails,
  getEvMarketShare,
  getEvMonthlyTrend,
  getEvTopMakes,
} from "@web/queries/cars";
import { Zap } from "lucide-react";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";

export const metadata: Metadata = {
  title: "Electric Vehicles | Singapore EV Trends",
  description:
    "Track Singapore's electric vehicle adoption with BEV, PHEV, and hybrid registration trends, market share analysis, and top EV makes.",
  openGraph: {
    title: "Electric Vehicles - Singapore EV Trends",
    description:
      "Explore BEV, PHEV, and hybrid adoption trends, market share, and brand rankings in Singapore.",
    type: "website",
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

export default async function ElectricVehiclesPage() {
  const [summary, monthlyTrend, marketShare, topMakes, makeDetails] =
    await Promise.all([
      getEvLatestSummary(),
      getEvMonthlyTrend(),
      getEvMarketShare(),
      getEvTopMakes(),
      getEvMakeDetails(),
    ]);

  if (!summary) {
    return (
      <EmptyState
        icon={
          <div className="flex size-16 items-center justify-center rounded-2xl bg-default">
            <Zap className="size-8 text-muted" />
          </div>
        }
        title="No Data Available Yet"
        description="Electric vehicle registration data is not available at the moment. Please check back later."
        showDefaultActions={false}
      />
    );
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDatasetSchema("electric-vehicles"),
        }}
      />
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
      <section className="flex flex-col gap-10">
        <DashboardPageHeader
          title={
            <DashboardPageTitle
              title="Electric Vehicles"
              subtitle="BEV, PHEV, and hybrid adoption trends and market share in Singapore."
            />
          }
        />

        <AnimatedSection order={1}>
          <EvMetrics summary={summary} />
        </AnimatedSection>

        <AnimatedSection order={2}>
          <AdoptionTrendChart data={monthlyTrend} />
        </AnimatedSection>

        <AnimatedSection order={3}>
          <MarketShareChart data={marketShare} />
        </AnimatedSection>

        <AnimatedSection order={4}>
          <TopMakesChart data={topMakes} month={summary.month} />
        </AnimatedSection>

        <AnimatedSection order={5}>
          <MakeTable data={makeDetails} month={summary.month} />
        </AnimatedSection>
      </section>
    </>
  );
}
