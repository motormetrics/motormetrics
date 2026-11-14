import { Skeleton, Typography } from "@heroui/react";
import { CarsMonthPicker } from "@web/app/(main)/(dashboard)/cars/components/cars-month-picker";
import { DimensionPanel } from "@web/app/(main)/(dashboard)/cars/components/dimension-panel";
import {
  buildCarsFaqs,
  loadLatestRegistrationsSummary,
} from "@web/app/(main)/(dashboard)/cars/components/faq-data";
import { FuelMix } from "@web/app/(main)/(dashboard)/cars/components/fuel-mix";
import {
  HeadGrid,
  HeadTitle,
  KeysAside,
} from "@web/app/(main)/(dashboard)/cars/components/keys-aside";
import { MoversRail } from "@web/app/(main)/(dashboard)/cars/components/movers-rail";
import { PopulationPanel } from "@web/app/(main)/(dashboard)/cars/components/population-panel";
import {
  CarsMonthLabel,
  RegistrationsHero,
  RegistrationsLead,
  RegistrationsTrend,
  RegistrationsTrendCaption,
} from "@web/app/(main)/(dashboard)/cars/components/registrations-hero";
import { SectionErrorBoundary } from "@web/components/error-boundary";
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
import { SITE_URL } from "@web/config";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

const title = "Singapore Car Registration Data";
const description =
  "Explore Singapore vehicle data including new registrations, deregistrations, makes, fuel types, vehicle types, and PARF calculator.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}/cars`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/cars",
  },
};

interface PageProps {
  searchParams: Promise<SearchParams>;
}

/** The questions and their FAQPage schema, with the latest figures quoted. */
async function CarsFaq() {
  const faqs = buildCarsFaqs(await loadLatestRegistrationsSummary());

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

const JUMP_LINKS = [
  { href: "#cars-trend", label: "Registrations by month" },
  { href: "#cars-break", label: "Breakdown" },
  { href: "#cars-move", label: "Movers and the fleet" },
];

/** The selected month, streamed into a line of fixed copy. */
function MonthSlot({ searchParams }: PageProps) {
  return (
    // A non-breaking space holds the line until the month arrives.
    <Suspense fallback={" "}>
      <CarsMonthLabel searchParams={searchParams} />
    </Suspense>
  );
}

export default function CarsPage({ searchParams }: PageProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      {/* Direction D's head. The labels, title and source are fixed copy in
          the static shell; each figure that follows `?month=` streams in
          behind its own boundary. */}
      <HeadGrid
        keys={
          <KeysAside
            eyebrow={
              <>
                Key numbers · <MonthSlot searchParams={searchParams} /> by
                powertrain
              </>
            }
            jump={JUMP_LINKS}
            label="New cars by powertrain"
            source="Source: LTA via DataMall."
          >
            <SectionErrorBoundary title="Fuel mix unavailable">
              <Suspense fallback={<Skeleton className="h-36 w-full" />}>
                <FuelMix searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
          </KeysAside>
        }
      >
        <HeadTitle
          eyebrow={
            <>
              Cars · <MonthSlot searchParams={searchParams} />
            </>
          }
          title="New car registrations"
        />
        <SectionErrorBoundary title="Registration summary unavailable">
          <Suspense fallback={<Skeleton className="h-36 w-full max-w-xl" />}>
            <RegistrationsHero searchParams={searchParams} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-14 w-full max-w-prose" />}>
            <RegistrationsLead searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
        <SourceNote>Source: LTA via DataMall.</SourceNote>
        <div className="flex flex-wrap gap-2">
          <Suspense fallback={<Skeleton className="h-8 w-36" />}>
            <CarsMonthPicker searchParams={searchParams} />
          </Suspense>
          <SharePill title="New car registrations" />
        </div>
      </HeadGrid>

      <Hairline />

      <section
        aria-labelledby="cars-trend-h"
        className="flex scroll-mt-4 flex-col gap-4"
        id="cars-trend"
      >
        <div className="flex min-w-0 flex-col gap-1">
          <Typography.Paragraph
            className="uppercase"
            color="muted"
            size="xs"
            weight="semibold"
          >
            Figure 1 · Trend
          </Typography.Paragraph>
          <Typography.Heading
            className="text-xl md:text-2xl"
            id="cars-trend-h"
            level={2}
            weight="bold"
          >
            Registrations by month, last 12 months
          </Typography.Heading>
          <Typography.Paragraph
            className="max-w-prose tabular-nums"
            color="muted"
            size="sm"
          >
            <Suspense fallback={" "}>
              <RegistrationsTrendCaption searchParams={searchParams} />
            </Suspense>
          </Typography.Paragraph>
        </div>
        <SectionErrorBoundary title="Registration trend unavailable">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <RegistrationsTrend searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
        <SourceNote>
          Source: LTA via DataMall · New car registrations, all makes and fuel
          types, zero-based. Hover or tap a bar for its value.
        </SourceNote>
      </section>

      <Hairline />

      {/* The searchable, sortable dimension table. Its heading lives inside
          the client table, beside the dimension tabs that read the URL. */}
      <section className="scroll-mt-4" id="cars-break">
        <SectionErrorBoundary title="Registration breakdown unavailable">
          <Suspense fallback={<Skeleton className="h-160 w-full" />}>
            <DimensionPanel searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
      </section>

      <Hairline />

      <section className="flex scroll-mt-4 flex-col gap-6" id="cars-move">
        <SectionHead
          eyebrow="Figure 3 · Movers and vehicle population"
          title="Fastest growing makes, and the fleet on the road"
        />
        <OverviewGrid>
          <SectionErrorBoundary title="Movers unavailable">
            <MoversRail searchParams={searchParams} />
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Vehicle population unavailable">
            <PopulationPanel />
          </SectionErrorBoundary>
        </OverviewGrid>
        <SourceNote>
          Source: LTA via DataMall (registrations); LTA annual vehicle
          population.
        </SourceNote>
      </section>

      <Hairline />

      <CarsFaq />
    </OverviewPage>
  );
}
