import { CostMetrics } from "@web/app/(main)/(explore)/cars/costs/components/cost-metrics";
import { CostRangeCard } from "@web/app/(main)/(explore)/cars/costs/components/cost-range-card";
import { CostTable } from "@web/app/(main)/(explore)/cars/costs/components/cost-table";
import { FuelTypeCostChart } from "@web/app/(main)/(explore)/cars/costs/components/fuel-type-cost-chart";
import { VesDistributionChart } from "@web/app/(main)/(explore)/cars/costs/components/ves-distribution-chart";
import { AnimatedSection } from "@web/app/(main)/(explore)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { EmptyState } from "@web/components/shared/empty-state";
import { StructuredData } from "@web/components/structured-data";
import Typography from "@web/components/typography";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { getLatestCarCosts } from "@web/queries/car-costs";
import { DollarSign } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const metadata: Metadata = {
  title: "Car Cost Breakdown | New Car Prices in Singapore",
  description:
    "See how new car prices in Singapore are composed — OMV, ARF, VES rebates/surcharges, and COE premiums for every model.",
  openGraph: {
    title: "Car Cost Breakdown - New Car Prices in Singapore",
    description:
      "Understand the full cost of buying a new car in Singapore with OMV, ARF, VES, and COE breakdown.",
    type: "website",
  },
  alternates: {
    canonical: "/cars/costs",
  },
};

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Car Cost Breakdown",
  description:
    "Breakdown of new car costs in Singapore including OMV, ARF, VES rebates/surcharges, and COE premiums for all available models",
  url: `${SITE_URL}/cars/costs`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

export default async function CarCostsPage() {
  const data = await getLatestCarCosts();

  return (
    <>
      <StructuredData data={structuredData} />
      <section className="flex flex-col gap-4">
        <DashboardPageHeader
          title={
            <DashboardPageTitle
              title="Car Cost Breakdown"
              subtitle="See how new car prices are composed — OMV, ARF, VES, and COE."
            />
          }
        />

        {data.length === 0 ? (
          <EmptyState
            icon={
              <div className="flex size-16 items-center justify-center rounded-2xl bg-default-100">
                <DollarSign className="size-8 text-default-400" />
              </div>
            }
            title="No Cost Data Available"
            description="Car cost data has not been ingested yet. Data will be available once the LTA Car Cost Update is processed."
            showDefaultActions={false}
          />
        ) : (
          <>
            <AnimatedSection order={1}>
              <CostMetrics data={data} />
            </AnimatedSection>

            <AnimatedSection order={2}>
              <div className="flex flex-col gap-4">
                <Typography.H2>Price Ranges by Fuel Type</Typography.H2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <CostRangeCard data={data} />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection order={3}>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <FuelTypeCostChart data={data} />
                </div>
                <div className="lg:col-span-2">
                  <VesDistributionChart data={data} />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection order={4}>
              <Suspense>
                <CostTable data={data} />
              </Suspense>
            </AnimatedSection>
          </>
        )}
      </section>
    </>
  );
}
