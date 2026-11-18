import { Skeleton } from "@heroui/react";
import { CarsMonthPicker } from "@web/app/(main)/(dashboard)/cars/components/cars-month-picker";
import {
  CompareMonthSelects,
  CompareTables,
} from "@web/app/(main)/(dashboard)/cars/components/compare-months";
import { DimensionPanel } from "@web/app/(main)/(dashboard)/cars/components/dimension-panel";
import {
  buildCarsFaqs,
  loadLatestRegistrationsSummary,
} from "@web/app/(main)/(dashboard)/cars/components/faq-data";
import { RangeTabs } from "@web/app/(main)/(dashboard)/cars/components/filters";
import { MoversRail } from "@web/app/(main)/(dashboard)/cars/components/movers-rail";
import { PopulationPanel } from "@web/app/(main)/(dashboard)/cars/components/population-panel";
import {
  FuelCaption,
  FuelNote,
  FuelTable,
  TrendCaption,
  TrendChart,
  TrendNote,
  TrendPeriod,
  TrendTitle,
  VehicleTypePeriod,
  VehicleTypes,
} from "@web/app/(main)/(dashboard)/cars/components/registrations-report";
import {
  ReportFuel,
  ReportFuelSelect,
  ReportHero,
  ReportKeyNumbers,
  ReportLead,
  ReportMonth,
  type ReportProps,
} from "@web/app/(main)/(dashboard)/cars/components/report-head";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { KeysAside } from "@web/components/shared/key-numbers";
import {
  Hairline,
  OverviewGrid,
  OverviewPage,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { FilterGroup, FiltersPanel } from "@web/components/shared/page-filters";
import { PageHead } from "@web/components/shared/page-head";
import {
  PageBody,
  RelatedLinks,
  ScopeControl,
} from "@web/components/shared/page-layout";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";

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

/** The sections below the head, for the key numbers' "On this page" links. */
const JUMP_LINKS = [
  { href: "#cars-trend", label: "New cars by month" },
  { href: "#cars-fuel", label: "By fuel type" },
  { href: "#cars-type", label: "By vehicle type" },
  { href: "#cars-break", label: "Makes this year" },
  { href: "#cars-compare", label: "Compare two months" },
];

const SECTION = "flex scroll-mt-4 flex-col gap-4";

/** A line of text that follows the search params, held open by a space. */
function Slot({ children }: { children: ReactNode }) {
  return <Suspense fallback={" "}>{children}</Suspense>;
}

export default function CarsPage({ searchParams }: ReportProps) {
  const props: ReportProps = { searchParams };

  const filters = (
    <>
      <FilterGroup label="Fuel type">
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <ReportFuelSelect />
        </Suspense>
      </FilterGroup>
      <FilterGroup label="Trend range">
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <RangeTabs />
        </Suspense>
      </FilterGroup>
    </>
  );

  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      {/* The head carries the title, the month and Share. The month sets what
          the whole page reports on, so its select sits in the head; the fuel
          type and trend range narrow the page, so they sit in the right
          sidebar, with a "Filters" button in the head where the sidebar does
          not fit. */}
      <PageHead
        controls={
          <ScopeControl label="Month">
            <Suspense fallback={<Skeleton className="h-10 w-40" />}>
              <CarsMonthPicker searchParams={searchParams} />
            </Suspense>
          </ScopeControl>
        }
        filters={filters}
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-32" />}>
            <ReportMonth {...props} />
          </Suspense>
        }
        title="New registrations"
      />

      <PageBody
        rail={
          <>
            <FiltersPanel>{filters}</FiltersPanel>
            <KeysAside
              eyebrow={
                <>
                  New cars ·{" "}
                  <Slot>
                    <ReportFuel {...props} />
                  </Slot>
                </>
              }
              jump={JUMP_LINKS}
              label="Key numbers"
              source="Counted in the month of registration. Source: LTA via DataMall."
            >
              <SectionErrorBoundary title="Key numbers unavailable">
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                  <ReportKeyNumbers {...props} />
                </Suspense>
              </SectionErrorBoundary>
            </KeysAside>
          </>
        }
      >
        <section className={SECTION} id="cars-trend">
          <SectionHead
            caption={
              <>
                <Slot>
                  <TrendPeriod {...props} />
                </Slot>
                {". "}
                <Slot>
                  <TrendCaption {...props} />
                </Slot>
              </>
            }
            title={
              <Suspense fallback="New cars by month">
                <TrendTitle {...props} />
              </Suspense>
            }
          />
          <SectionErrorBoundary title="Registration trend unavailable">
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
              <TrendChart {...props} />
            </Suspense>
          </SectionErrorBoundary>
          <SourceNote>
            <Slot>
              <TrendNote {...props} />
            </Slot>{" "}
            Zero-based; hover or tap a bar for its value.
          </SourceNote>
        </section>

        <Hairline />

        <section className={SECTION} id="cars-fuel">
          <SectionHead
            caption={
              <Slot>
                <FuelCaption {...props} />
              </Slot>
            }
            title="By fuel type"
          />
          <SectionErrorBoundary title="Fuel types unavailable">
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <FuelTable {...props} />
            </Suspense>
          </SectionErrorBoundary>
          <SourceNote>
            <Slot>
              <FuelNote {...props} />
            </Slot>
          </SourceNote>
        </section>

        <Hairline />

        <section className={SECTION} id="cars-type">
          <SectionHead
            caption={
              <Slot>
                <VehicleTypePeriod {...props} />
              </Slot>
            }
            link={{
              href: "/cars/vehicle-types",
              label: "Vehicle types in full",
            }}
            title="By vehicle type"
          />
          <SectionErrorBoundary title="Vehicle types unavailable">
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
              <VehicleTypes {...props} />
            </Suspense>
          </SectionErrorBoundary>
          <SourceNote>
            A car counts in the month it is registered, which can lag the
            bidding exercise that won its COE by several weeks. Figures cover
            cars only; other vehicle classes are counted separately under their
            own categories.
          </SourceNote>
        </section>

        <Hairline />

        {/* The searchable, sortable breakdown for the year to date. Its
            heading lives inside the client table, beside the switch between
            makes, vehicle types and fuel types. */}
        <section className="scroll-mt-4" id="cars-break">
          <SectionErrorBoundary title="Registration breakdown unavailable">
            <Suspense fallback={<Skeleton className="h-160 w-full" />}>
              <DimensionPanel searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </section>

        <Hairline />

        <section className={SECTION} id="cars-compare">
          <SectionHead
            caption="New cars by fuel type and by vehicle type"
            title="Compare two months"
            trailing={
              <Suspense
                fallback={<Skeleton className="h-10 w-80 max-w-full" />}
              >
                <CompareMonthSelects searchParams={searchParams} />
              </Suspense>
            }
          />
          <SectionErrorBoundary title="Comparison unavailable">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <CompareTables searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </section>

        <Hairline />

        {/* Below here: sections the artboard does not draw, kept until the
            owner decides which to cut. */}
        <section className={SECTION} id="cars-range">
          <SectionHead title="The month in its range" />
          <SectionErrorBoundary title="Registration summary unavailable">
            <Suspense fallback={<Skeleton className="h-36 w-full max-w-xl" />}>
              <ReportHero {...props} />
            </Suspense>
            <Suspense
              fallback={<Skeleton className="h-14 w-full max-w-prose" />}
            >
              <ReportLead {...props} />
            </Suspense>
          </SectionErrorBoundary>
        </section>

        <Hairline />

        <section className="flex scroll-mt-4 flex-col gap-6" id="cars-move">
          <SectionHead title="Fastest growing makes, and cars on the road" />
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
      </PageBody>

      <RelatedLinks
        links={[
          { href: "/cars/makes", label: "Makes" },
          { href: "/cars/electric-vehicles", label: "Electric vehicles" },
          { href: "/cars/deregistrations", label: "Deregistrations" },
          { href: "/cars/annual", label: "Vehicle population" },
        ]}
      />
    </OverviewPage>
  );
}
