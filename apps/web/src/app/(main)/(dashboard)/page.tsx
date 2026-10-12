import { Skeleton } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { PqpCeiling } from "@web/app/(main)/(dashboard)/coe/components/pqp-ceiling";
import { CategoryMergerCallout } from "@web/app/(main)/(dashboard)/components/category-merger-callout";
import { CoePremiumTable } from "@web/app/(main)/(dashboard)/components/coe-premium-table";
import { EvMakes } from "@web/app/(main)/(dashboard)/components/ev-makes";
import { EvShare } from "@web/app/(main)/(dashboard)/components/ev-share";
import { HOME_FAQS } from "@web/app/(main)/(dashboard)/components/faq-data";
import { FuelMix } from "@web/app/(main)/(dashboard)/components/fuel-mix";
import { KpiStrip } from "@web/app/(main)/(dashboard)/components/kpi-strip";
import {
  DeregistrationsByMonth,
  RegistrationsByMonth,
} from "@web/app/(main)/(dashboard)/components/monthly-volumes";
import { TopMakes } from "@web/app/(main)/(dashboard)/components/top-makes";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import {
  Hairline,
  OverviewGrid,
  OverviewPage,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { LOGO_URL, SITE_TITLE, SITE_URL, SUPPORT_EMAIL } from "@web/config";
import { BRAND_SOCIAL_PROFILE_URLS } from "@web/config/socials";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getLatestMonth } from "@web/utils/dates/months";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: { absolute: `${SITE_TITLE} (formerly SG Cars Trends)` },
  description:
    "Track Singapore car registration trends, COE bidding results, and automotive market insights. Latest data from Land Transport Authority (LTA) with interactive charts, EV and hybrid statistics, and AI-powered analysis.",
  keywords: [
    "Singapore car registration",
    "COE prices",
    "car trends Singapore",
    "vehicle statistics",
    "electric vehicles Singapore",
    "hybrid cars",
    "LTA data",
  ],
  openGraph: {
    ...baseOpenGraph,
    title: `${SITE_TITLE} (formerly SG Cars Trends)`,
    description:
      "Track Singapore car registration trends and COE bidding results with interactive charts and latest market insights.",
    url: SITE_URL,
  },
  twitter: {
    ...baseTwitter,
    title: `${SITE_TITLE} (formerly SG Cars Trends)`,
    description:
      "Track Singapore car registration trends and COE bidding results with interactive charts.",
  },
  alternates: {
    canonical: "/",
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_TITLE,
  url: SITE_URL,
  description:
    "Analysis of new car registration trends in Singapore. Insights on popular makes, fuel and vehicle types, COE bidding results, and market data.",
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/cars/makes?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;

function OrganizationStructuredData() {
  const sameAs = [...BRAND_SOCIAL_PROFILE_URLS];

  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_TITLE,
        url: SITE_URL,
        logo: LOGO_URL,
        description:
          "A platform for exploring Singapore car registration statistics, COE bidding results, and market data.",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: SUPPORT_EMAIL,
          url: `${SITE_URL}/contact`,
        },
        address: { "@type": "PostalAddress", addressCountry: "SG" },
        ...(sameAs.length > 0 ? { sameAs } : {}),
      }}
    />
  );
}

/**
 * The homepage always shows the latest month, so the sub names it rather than
 * offering a picker; each section links to the page that can change it.
 */
async function LatestMonthSub() {
  const month = await getLatestMonth("cars");

  return (
    <>
      <span className="font-semibold text-foreground">
        {formatDateToMonthYear(month)}
      </span>{" "}
      registrations and COE results · Source: LTA via DataMall
    </>
  );
}

/** A section-shaped placeholder: eyebrow, figure, then the chart area. */
function BlockSkeleton({ chartHeight }: { chartHeight: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-14 w-56" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className={`w-full rounded-2xl ${chartHeight}`} />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <StructuredData data={webSiteSchema} />
      <OrganizationStructuredData />

      <OverviewPage className="gap-10 max-md:gap-7">
        <CategoryMergerCallout />

        <div className="flex flex-col gap-7">
          <PageHead
            eyebrow="Singapore car market"
            sub={
              <Suspense fallback={<Skeleton className="h-5 w-72" />}>
                <LatestMonthSub />
              </Suspense>
            }
            title="Market overview"
          />

          <SectionErrorBoundary title="Headline figures unavailable">
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
              <KpiStrip />
            </Suspense>
          </SectionErrorBoundary>
        </div>

        <OverviewGrid className="gap-10 lg:grid-cols-2 lg:gap-x-14 lg:max-xl:gap-x-9">
          <SectionErrorBoundary title="Registrations unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-64" />}>
              <RegistrationsByMonth />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Deregistrations unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-64" />}>
              <DeregistrationsByMonth />
            </Suspense>
          </SectionErrorBoundary>
        </OverviewGrid>

        <Hairline />

        <OverviewGrid className="gap-10 lg:grid-cols-7 lg:gap-x-14 lg:max-xl:gap-x-9 lg:*:col-span-3 lg:*:first:col-span-4">
          <SectionErrorBoundary title="COE premiums unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-60" />}>
              <CoePremiumTable />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="PQP rates unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-48" />}>
              <PqpCeiling />
            </Suspense>
          </SectionErrorBoundary>
        </OverviewGrid>

        <Hairline />

        <OverviewGrid className="gap-10 lg:grid-cols-7 lg:gap-x-14 lg:max-xl:gap-x-9 lg:*:col-span-3 lg:*:first:col-span-4">
          <SectionErrorBoundary title="Top makes unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-[220px]" />}>
              <TopMakes />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Fuel mix unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-[172px]" />}>
              <FuelMix />
            </Suspense>
          </SectionErrorBoundary>
        </OverviewGrid>

        <Hairline />

        <OverviewGrid className="gap-10 lg:grid-cols-7 lg:gap-x-14 lg:max-xl:gap-x-9 lg:*:col-span-3 lg:*:first:col-span-4">
          <SectionErrorBoundary title="EV share unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-64" />}>
              <EvShare />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="EV makes unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-48" />}>
              <EvMakes />
            </Suspense>
          </SectionErrorBoundary>
        </OverviewGrid>

        <Hairline />

        <StructuredData
          data={{
            "@context": "https://schema.org",
            ...generateFAQPageSchema([{ items: HOME_FAQS }]),
          }}
        />
        <PageFaq faqs={HOME_FAQS} />
      </OverviewPage>
    </>
  );
}
