import { Skeleton, Typography } from "@heroui/react";
import { groupByExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { buildPremiumsFaqs } from "@web/app/(main)/(dashboard)/coe/premiums/components/faq-data";
import {
  ExerciseEyebrow,
  PremiumsAnswer,
  PremiumsCategoryTabs,
  PremiumsKeyNumbers,
  PremiumsLead,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-headline";
import { PremiumsReport } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-report";
import {
  type PremiumsPageProps,
  SelectedCategory,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-view";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthMenu } from "@web/components/shared/month-menu";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SectionLink,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getCoeMonths, getCoeResults } from "@web/queries/coe";
import type { Metadata } from "next";
import { Suspense } from "react";

const title = "COE Premiums by Category";
const description =
  "COE premiums for each category, Cat A to Cat E: every exercise's closing premium, with the quota and bids behind it.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}/coe/premiums`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/coe/premiums",
  },
  authors: [{ name: SITE_TITLE, url: SITE_URL }],
  creator: SITE_TITLE,
  publisher: SITE_TITLE,
};

/** The figures below the head, for the key numbers' "On this page" links. */
const JUMP_LINKS = [
  { href: "#prem-hist", label: "Premium history" },
  { href: "#prem-all", label: "All categories" },
  { href: "#prem-12", label: "Last 12 exercises" },
  { href: "#prem-rng", label: "Premium range" },
];

export default function COEPremiumsPage({ searchParams }: PremiumsPageProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      {/* Direction D's head: eyebrow, title, controls, the range hero, lead
          and source, with the key numbers beside it once the page is wide and
          under it before then. The copy is static; only the parts that read
          the selection in the URL wait behind a boundary. */}
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
                Certificate of Entitlement
                <Suspense fallback={null}>
                  <ExerciseEyebrow searchParams={searchParams} />
                </Suspense>
              </Typography.Paragraph>
              <Typography.Heading level={1}>
                COE premiums by category
              </Typography.Heading>
            </div>
            <div className="flex flex-wrap items-end gap-x-3.5 gap-y-2.5">
              <Suspense
                fallback={<Skeleton className="h-10 w-40 rounded-md" />}
              >
                <PremiumsMonthMenu />
              </Suspense>
              <Suspense
                fallback={<Skeleton className="h-10 w-80 rounded-md" />}
              >
                <PremiumsCategoryTabs searchParams={searchParams} />
              </Suspense>
              <SharePill title="COE premiums by category" />
            </div>
            <SectionErrorBoundary title="Premium unavailable">
              <Suspense
                fallback={<Skeleton className="h-44 w-full max-w-xl" />}
              >
                <PremiumsAnswer searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
            <Suspense
              fallback={<Skeleton className="h-14 w-full max-w-prose" />}
            >
              <PremiumsLead searchParams={searchParams} />
            </Suspense>
            <Typography.Paragraph color="muted" size="sm">
              Source: LTA via DataMall. Closing premium per bidding exercise.
            </Typography.Paragraph>
          </div>

          <aside aria-label="Key numbers" className="flex flex-col gap-3">
            <Typography.Paragraph
              className="uppercase"
              color="muted"
              size="xs"
              weight="semibold"
            >
              Key numbers · <SelectedCategory searchParams={searchParams} />
            </Typography.Paragraph>
            <SectionErrorBoundary title="Key numbers unavailable">
              <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <PremiumsKeyNumbers searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
            <nav aria-label="On this page">
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                {JUMP_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      className="font-semibold text-accent-strong text-sm no-underline hover:text-accent-deep"
                      href={href}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <Typography.Paragraph color="muted" size="xs">
              Source: LTA via DataMall.
            </Typography.Paragraph>
          </aside>
        </div>
      </div>

      <Hairline />
      <SectionErrorBoundary title="COE premiums unavailable">
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          }
        >
          <PremiumsReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
      <Hairline />

      <section className="flex max-w-prose flex-col gap-4">
        <SectionHead
          eyebrow="Reading the numbers"
          title="How premiums are set"
        />
        <Typography.Paragraph className="text-muted-strong">
          A premium is the price of the last successful bid in an exercise, so
          it is set by demand rather than announced in advance.
        </Typography.Paragraph>
        <Typography.Paragraph className="text-muted-strong">
          Renewing an existing COE uses the PQP instead: the three-month moving
          average of premiums in that category.
        </Typography.Paragraph>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <SectionLink className="ml-0" href="/coe/pqp">
            PQP rates
          </SectionLink>
          <SectionLink className="ml-0" href="/coe/results">
            Results by exercise
          </SectionLink>
        </div>
      </section>

      <Hairline />

      <PremiumsFaq />
    </OverviewPage>
  );
}

/**
 * The questions and their FAQPage schema. Quotes the latest exercise whatever
 * month is selected, so it reads only cached data and stays in the static
 * shell without a boundary.
 */
async function PremiumsFaq() {
  const faqs = buildPremiumsFaqs(groupByExercise(await getCoeResults()).at(-1));

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

/** The month picker. Its data is cached, but it reads the URL on the client. */
async function PremiumsMonthMenu() {
  const months = (await getCoeMonths()).map(({ month }) => month);

  return <MonthMenu latestMonth={months[0]} months={months} />;
}
