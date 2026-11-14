import { Skeleton } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { CarsMonthPicker } from "@web/app/(main)/(dashboard)/cars/components/cars-month-picker";
import { loadLatestRegistrationsSummary } from "@web/app/(main)/(dashboard)/cars/components/faq-data";
import {
  HeadGrid,
  HeadTitle,
  KeysAside,
} from "@web/app/(main)/(dashboard)/cars/components/keys-aside";
import { buildRegistrationsFaqs } from "@web/app/(main)/(dashboard)/cars/registrations/components/faq-data";
import { RangeTabs } from "@web/app/(main)/(dashboard)/cars/registrations/components/filters";
import {
  RegistrationsReport,
  TrendCaption,
  TrendChart,
  TrendNote,
  TrendPeriod,
  TrendTitle,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/registrations-report";
import {
  ReportFuel,
  ReportFuelTabs,
  ReportHero,
  ReportKeyNumbers,
  ReportLead,
  ReportMonth,
  type ReportProps,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/report-head";
import { TrendsCompareButton } from "@web/app/(main)/(dashboard)/cars/registrations/components/trends-compare-button";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getComparisonData } from "@web/queries/cars/compare";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { type ReactNode, Suspense } from "react";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  const formattedMonth = formatDateToMonthYear(month);

  const title = "New Car Registrations in Singapore";
  const description = `${formattedMonth} new car registrations in Singapore from LTA data, by make, fuel type and vehicle type.`;

  return {
    title,
    description,
    openGraph: {
      ...baseOpenGraph,
      title,
      description,
      url: `${SITE_URL}/cars/registrations`,
    },
    twitter: {
      ...baseTwitter,
      title,
      description,
    },
    alternates: {
      canonical: "/cars/registrations",
    },
    authors: [{ name: SITE_TITLE, url: SITE_URL }],
    creator: SITE_TITLE,
    publisher: SITE_TITLE,
  };
}

/** The questions and their FAQPage schema, with the latest figures quoted. */
async function RegistrationsFaq() {
  const faqs = buildRegistrationsFaqs(await loadLatestRegistrationsSummary());

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
  { href: "#reg-trend", label: "Registrations by month" },
  { href: "#reg-fuelt", label: "By fuel type" },
  { href: "#reg-mix", label: "Makes and vehicle types" },
];

/** A line of text that follows the search params, held open by a space. */
function Slot({ children }: { children: ReactNode }) {
  return <Suspense fallback={" "}>{children}</Suspense>;
}

/** A labelled filter in the head's toolbar; the label is static. */
function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 max-w-full flex-col gap-1">
      <span className="font-semibold text-muted text-xs">{label}</span>
      {children}
    </div>
  );
}

/** A figure's title block, with its streamed caption under the heading. */
function FigureHead({
  caption,
  eyebrow,
  title,
  trailing,
}: {
  caption: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <SectionHead
      caption={<Slot>{caption}</Slot>}
      eyebrow={eyebrow}
      title={title}
      trailing={trailing}
    />
  );
}

export default function Page({ searchParams }: PageProps) {
  const props: ReportProps = { searchParams };

  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      {/* Direction D's head. The filters sit in the head because the fuel
          type narrows the hero, the key numbers and the chart. */}
      <HeadGrid
        keys={
          <KeysAside
            eyebrow={
              <>
                Key numbers ·{" "}
                <Slot>
                  <ReportFuel {...props} />
                </Slot>
              </>
            }
            jump={JUMP_LINKS}
            label="Key numbers"
            source="Source: LTA via DataMall."
          >
            <SectionErrorBoundary title="Key numbers unavailable">
              <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <ReportKeyNumbers {...props} />
              </Suspense>
            </SectionErrorBoundary>
          </KeysAside>
        }
      >
        <HeadTitle
          eyebrow={
            <>
              Cars ·{" "}
              <Slot>
                <ReportMonth {...props} />
              </Slot>
            </>
          }
          title="Car registrations"
        />
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Month">
            <Suspense fallback={<Skeleton className="h-8 w-36" />}>
              <CarsMonthPicker searchParams={searchParams} />
            </Suspense>
          </Field>
          <Field label="Fuel type">
            <Suspense fallback={<Skeleton className="h-8 w-96 max-w-full" />}>
              <ReportFuelTabs />
            </Suspense>
          </Field>
        </div>
        <SectionErrorBoundary title="Registration summary unavailable">
          <Suspense fallback={<Skeleton className="h-36 w-full max-w-xl" />}>
            <ReportHero {...props} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-14 w-full max-w-prose" />}>
            <ReportLead {...props} />
          </Suspense>
        </SectionErrorBoundary>
        <SourceNote>
          Counted in the month of registration. Source: LTA via DataMall.
        </SourceNote>
        <div>
          <SharePill title="Car registrations" />
        </div>
      </HeadGrid>

      <Hairline />

      <section className="flex scroll-mt-4 flex-col gap-4" id="reg-trend">
        <FigureHead
          caption={<TrendCaption {...props} />}
          eyebrow={
            <>
              Figure 1 · Trend ·{" "}
              <Slot>
                <TrendPeriod {...props} />
              </Slot>
            </>
          }
          title={
            <Suspense fallback="Registrations by month">
              <TrendTitle {...props} />
            </Suspense>
          }
          trailing={
            <Suspense fallback={<Skeleton className="h-8 w-32" />}>
              <RangeTabs />
            </Suspense>
          }
        />
        <SectionErrorBoundary title="Registration trend unavailable">
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <TrendChart {...props} />
          </Suspense>
        </SectionErrorBoundary>
        <SourceNote>
          Source: LTA via DataMall ·{" "}
          <Slot>
            <TrendNote {...props} />
          </Slot>{" "}
          Zero-based; hover or tap a bar for its value.
        </SourceNote>
      </section>

      <Hairline />

      {/* Figures not yet ported, still drawn by the old report. */}
      <SectionErrorBoundary title="Registration data unavailable">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <RegistrationsReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      {/* The comp has no month-comparison block. Kept because it is working
          functionality rather than styling, and parked at the foot so it does
          not interrupt the report above it. */}
      <section className="flex flex-col gap-4">
        <SectionHead
          caption="Pick two months to see how registrations moved between them"
          eyebrow="Compare"
          title="Compare months"
        />
        <SectionErrorBoundary title="Comparison unavailable">
          <Suspense fallback={<Skeleton className="h-12 w-52" />}>
            <CarsCompareSection searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
      </section>

      <Hairline />

      <RegistrationsFaq />
    </OverviewPage>
  );
}

async function CarsCompareSection({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    month: parsedMonth,
    compareA,
    compareB,
  } = await loadSearchParams(searchParams);
  const [months, { month }] = await Promise.all([
    fetchMonthsForCars(),
    getMonthOrLatest(parsedMonth, "cars"),
  ]);

  const comparisonData =
    compareA && compareB ? await getComparisonData(compareA, compareB) : false;

  return (
    <TrendsCompareButton
      currentMonth={month}
      months={months}
      comparisonData={comparisonData}
    />
  );
}
