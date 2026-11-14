import { Skeleton, Typography } from "@heroui/react";
import { EmptyState } from "@heroui-pro/react";
import { AdoptionByMonth } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/adoption-by-month";
import { ChargingSummary } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/charging-summary";
import {
  ElectrifiedMix,
  MixCaption,
  MixTitle,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/electrified-total";
import {
  EvHero,
  EvKeyNumbers,
  EvLead,
  SelectedMonth,
  SelectedMonthName,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-head";
import { EvLeaderboard } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-leaderboard";
import { loadEvSelection } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import {
  summariseLeaderboard,
  yearToDateMakes,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { buildElectricVehiclesFaqs } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/faq-data";
import { RegistrationTrend } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/registration-trend";
import { VesBands } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ves-bands";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthMenu } from "@web/components/shared/month-menu";
import {
  Hairline,
  OverviewGrid,
  OverviewPage,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { EV_FUEL_TYPES, SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getEvMarketShare, getFuelTypeData } from "@web/queries/cars";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import { Zap } from "lucide-react";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const metadata: Metadata = {
  title: "Electric Vehicles in Singapore",
  description:
    "Track Singapore's electric vehicle adoption with BEV, PHEV, and hybrid registration trends, market share analysis, and top EV makes.",
  openGraph: {
    ...baseOpenGraph,
    title: "Electric Vehicles - Singapore EV Trends",
    description:
      "Explore BEV, PHEV, and hybrid adoption trends, market share, and brand rankings in Singapore.",
    url: `${SITE_URL}/cars/electric-vehicles`,
  },
  twitter: {
    ...baseTwitter,
    title: "Electric Vehicles - Singapore EV Trends",
    description:
      "Explore BEV, PHEV, and hybrid adoption trends, market share, and brand rankings in Singapore.",
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

interface PageProps {
  searchParams: Promise<SearchParams>;
}

function HeadlineSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-56" />
      <Skeleton className="h-16 w-48" />
      <Skeleton className="h-5 w-72" />
      <Skeleton className="h-[150px] w-full" />
    </div>
  );
}

function SectionSkeleton({ className = "h-64" }: { className?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className={`w-full ${className}`} />
    </div>
  );
}

/**
 * The questions and their FAQPage schema. Quotes the latest month's year to
 * date whatever month is selected, so it reads no search params.
 */
async function ElectricVehiclesFaq() {
  const [month, electric] = await Promise.all([
    getCarsLatestMonth(),
    getFuelTypeData(EV_FUEL_TYPES.BEV[0]),
  ]);
  const faqs = buildElectricVehiclesFaqs(
    month
      ? summariseLeaderboard(
          yearToDateMakes(electric.data, EV_FUEL_TYPES.BEV, month),
          month,
        )
      : undefined,
  );

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: faqs }]),
        }}
      />
      <PageFaq faqs={faqs} />
    </>
  );
}

export default function ElectricVehiclesPage({ searchParams }: PageProps) {
  // Started once, awaited only by the parts that show figures.
  const selection = loadEvSelection(searchParams);

  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <StructuredData data={structuredData} />
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

      {/* Direction D's head: eyebrow, title, range hero, lead, tools and
          source, with the key numbers beside it once the page is wide and
          under it before then. Only the figures wait on the selected month. */}
      <div className="@container">
        <div className="grid @7xl:grid-cols-2 @7xl:gap-16 gap-10">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Typography.Paragraph
                className="uppercase"
                color="muted"
                size="xs"
                weight="semibold"
              >
                Electric vehicles ·{" "}
                <Suspense fallback=" ">
                  <SelectedMonth selection={selection} />
                </Suspense>{" "}
                registrations
              </Typography.Paragraph>
              <Typography.Heading level={1}>
                Electric vehicles in Singapore
              </Typography.Heading>
            </div>
            <SectionErrorBoundary title="EV share unavailable">
              <EvHero selection={selection} />
            </SectionErrorBoundary>
            <Typography.Paragraph className="max-w-prose tabular-nums">
              <Suspense fallback={<Skeleton className="h-12 w-full" />}>
                <EvLead selection={selection} />
              </Suspense>
            </Typography.Paragraph>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-muted text-xs">Month</span>
                <Suspense fallback={<Skeleton className="h-10 w-36" />}>
                  <MonthControl searchParams={searchParams} />
                </Suspense>
              </div>
              <SharePill title="Electric vehicles in Singapore" />
            </div>
            <Typography.Paragraph color="muted" size="sm">
              New car registrations. EV means battery-electric. Source: LTA via
              DataMall.
            </Typography.Paragraph>
          </div>
          <SectionErrorBoundary title="Key numbers unavailable">
            <EvKeyNumbers selection={selection} />
          </SectionErrorBoundary>
        </div>
      </div>

      <Hairline />

      <section
        className="@container flex scroll-mt-4 flex-col gap-4"
        id="ev-mix"
      >
        <SectionHead
          caption={
            <Suspense fallback=" ">
              <MixCaption selection={selection} />
            </Suspense>
          }
          eyebrow={
            <>
              Figure 1 · Powertrain mix ·{" "}
              <Suspense fallback=" ">
                <SelectedMonthName selection={selection} />
              </Suspense>
            </>
          }
          title={
            <>
              Electrified total{" "}
              <Suspense fallback=" ">
                <MixTitle selection={selection} />
              </Suspense>
            </>
          }
        />
        <SectionErrorBoundary title="Electrified total unavailable">
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <ElectrifiedMix selection={selection} />
          </Suspense>
        </SectionErrorBoundary>
        <SourceNote>
          Source: LTA via DataMall · Electrified is battery-electric, plug-in
          hybrid and hybrid combined, as a share of the month&apos;s new cars.
        </SourceNote>
      </section>

      <Hairline />

      <SectionErrorBoundary title="Registration trend unavailable">
        <RegistrationTrend selection={selection} />
      </SectionErrorBoundary>

      <Hairline />

      <Suspense fallback={<HeadlineSkeleton />}>
        <EvOverview searchParams={searchParams} />
      </Suspense>

      <Hairline />

      <Suspense fallback={null}>
        <ElectricVehiclesFaq />
      </Suspense>
    </OverviewPage>
  );
}

async function MonthControl({ searchParams }: PageProps) {
  const { month: requestedMonth } = await loadSearchParams(searchParams);
  const [months, { month, wasAdjusted }] = await Promise.all([
    fetchMonthsForCars(),
    getMonthOrLatest(requestedMonth, "cars"),
  ]);

  if (months.length === 0) {
    return null;
  }

  return (
    <MonthMenu latestMonth={month} months={months} wasAdjusted={wasAdjusted} />
  );
}

async function EvOverview({ searchParams }: PageProps) {
  const { month: requestedMonth } = await loadSearchParams(searchParams);
  const [{ month }, marketShare] = await Promise.all([
    getMonthOrLatest(requestedMonth, "cars"),
    getEvMarketShare(),
  ]);

  if (marketShare.length === 0) {
    return (
      <EmptyState className="rounded-3xl bg-default/50" size="lg">
        <EmptyState.Header>
          <EmptyState.Media variant="icon">
            <Zap />
          </EmptyState.Media>
          <EmptyState.Title>No Data Available Yet</EmptyState.Title>
          <EmptyState.Description className="max-w-sm">
            Electric vehicle registration data is not available at the moment.
            Please check back later.
          </EmptyState.Description>
        </EmptyState.Header>
      </EmptyState>
    );
  }

  return (
    <>
      <OverviewGrid>
        <SectionErrorBoundary title="EV leaderboard unavailable">
          <Suspense fallback={<SectionSkeleton className="h-80" />}>
            <EvLeaderboard month={month} />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Monthly adoption unavailable">
          <Suspense fallback={<SectionSkeleton className="h-56" />}>
            <AdoptionByMonth month={month} />
          </Suspense>
        </SectionErrorBoundary>
      </OverviewGrid>

      <Hairline />

      <OverviewGrid>
        <SectionErrorBoundary title="Charging network unavailable">
          <Suspense fallback={<SectionSkeleton className="h-40" />}>
            <ChargingSummary />
          </Suspense>
        </SectionErrorBoundary>
        <VesBands />
      </OverviewGrid>
    </>
  );
}
