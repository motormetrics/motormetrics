import { Card, cn, Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { CategoryMergerFaq } from "@web/app/(main)/(dashboard)/coe/category-merger/components/category-merger-faq";
import { CombinedPool } from "@web/app/(main)/(dashboard)/coe/category-merger/components/combined-pool";
import { CATEGORY_MERGER_FAQS } from "@web/app/(main)/(dashboard)/coe/category-merger/components/faq-data";
import { FeebateBands } from "@web/app/(main)/(dashboard)/coe/category-merger/components/feebate-bands";
import { FeebateSpread } from "@web/app/(main)/(dashboard)/coe/category-merger/components/feebate-spread";
import { PremiumGap } from "@web/app/(main)/(dashboard)/coe/category-merger/components/premium-gap";
import { Reasons } from "@web/app/(main)/(dashboard)/coe/category-merger/components/reasons";
import { SystemComparison } from "@web/app/(main)/(dashboard)/coe/category-merger/components/system-comparison";
import {
  CONSULTATION_PAPER_URL,
  FEEDBACK_URL,
  FIVE_BANDS,
  MILESTONES,
  PUBLISHED_DATE,
  THREE_BANDS,
} from "@web/app/(main)/(dashboard)/coe/category-merger/utils/proposal";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { PageHead } from "@web/components/shared/page-head";
import {
  Report,
  ReportEyebrow,
  ReportHeadline,
  ReportNote,
  ReportSection,
  ReportStat,
} from "@web/components/shared/report";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { ArrowUpRight, CircleSlash, Truck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { Article, WithContext } from "schema-dts";

const path = "/coe/category-merger";
const title = "COE Category Merger: LTA's Feebate Explained";
const description =
  "LTA proposes merging COE Cat A and B into one category, with a car value feebate of up to $15,000 to keep luxury and mass-market cars apart. See the bands, the models and how the new COE system would work.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    type: "article",
    publishedTime: PUBLISHED_DATE,
    url: `${SITE_URL}${path}`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: path,
  },
};

const articleSchema: WithContext<Article> = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  datePublished: PUBLISHED_DATE,
  dateModified: PUBLISHED_DATE,
  url: `${SITE_URL}${path}`,
  mainEntityOfPage: `${SITE_URL}${path}`,
  inLanguage: "en-SG",
  author: { "@type": "Organization", name: SITE_TITLE, url: SITE_URL },
  publisher: { "@type": "Organization", name: SITE_TITLE, url: SITE_URL },
  isBasedOn: CONSULTATION_PAPER_URL,
};

const CATEGORY_E_OPTIONS = [
  {
    icon: CircleSlash,
    title: "Remove Category E",
    detail: "Urgent buyers would wait for the next exercise instead.",
  },
  {
    icon: Truck,
    title: "Keep it, for cars only",
    detail: "Protects the supply of Category C COEs for goods vehicles.",
  },
];

export default function CategoryMergerPage() {
  return (
    <Report className="gap-12">
      <StructuredData data={articleSchema} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "COE", path: "/coe" },
            { name: "Category merger", path },
          ]),
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: CATEGORY_MERGER_FAQS }]),
        }}
      />

      <PageHead
        description="LTA has proposed merging COE Categories A and B into one category for cars. Instead of an engine-based split, a fee-and-rebate system, which LTA calls a feebate, would set buyers apart by the value of the car they choose. This is a proposal under public consultation, not a decision."
        eyebrow="LTA public consultation"
        sub="Published 8 October 2026 · Feedback closes 2 November 2026"
        title="LTA's COE Category Merger Proposal"
      />

      <ReportHeadline
        label="Largest proposed rebate or surcharge"
        stats={
          <>
            <ReportStat label="Bands proposed" value="3 or 5" />
            <ReportStat label="Feedback closes" note="11.59pm" value="2 Nov" />
            <ReportStat
              label="Cat A–B premium gap"
              note="7 Oct 2026 exercise"
              value="$99"
            />
          </>
        }
        sub="Applied on top of the COE price, by the car model's median OMV"
        value="$15,000"
      />

      <ReportSection title="What LTA is proposing">
        <Typography.Paragraph className="max-w-prose" color="muted">
          Today, car buyers bid in one of two categories. Category A covers cars
          up to 1,600cc and 130bhp, or electric cars up to 110kW. Category B
          covers everything above. Under LTA&apos;s proposal, all car buyers
          would bid for COEs from one combined pool, and everyone would pay the
          same clearing price.
        </Typography.Paragraph>
        <Typography.Paragraph className="max-w-prose" color="muted">
          A feebate would then be applied to that price, based on the car model:
          a rebate for lower-value cars, no adjustment for mid-range ones and a
          surcharge for higher-value ones.
        </Typography.Paragraph>
        <SystemComparison />
        <Typography.Paragraph className="max-w-prose" color="muted">
          LTA says the aim is to keep a meaningful difference between what
          mass-market and luxury car buyers pay, not to change overall COE
          prices, which would still be set by demand and the available quota.
        </Typography.Paragraph>
      </ReportSection>

      <ReportSection title="Why LTA wants to change it">
        <Reasons />
      </ReportSection>

      <ReportSection
        caption="Ten years of closing premiums"
        title="How close Category A and B have come"
      >
        <SectionErrorBoundary title="Premium history unavailable">
          <Suspense fallback={<SkeletonCard className="h-[460px] w-full" />}>
            <PremiumGap />
          </Suspense>
        </SectionErrorBoundary>
      </ReportSection>

      <ReportSection caption="Latest exercise" title="One pool instead of two">
        <Typography.Paragraph className="max-w-prose" color="muted">
          Under the proposal, Category A and B quotas would be offered as one
          pool, with every car buyer bidding against every other.
        </Typography.Paragraph>
        <SectionErrorBoundary title="Latest quotas unavailable">
          <Suspense fallback={<SkeletonCard className="h-[220px] w-full" />}>
            <CombinedPool />
          </Suspense>
        </SectionErrorBoundary>
      </ReportSection>

      <ReportSection title="How the feebate bands would work">
        <Typography.Paragraph className="max-w-prose" color="muted">
          LTA proposes to use each car model&apos;s median Open Market Value
          (OMV), which is the value declared to Customs at import and already
          the basis of the ARF. Models would be banded by where their median OMV
          falls among recent registrations. LTA would review the bands every
          year and publish each model&apos;s band, so buyers know the rebate or
          surcharge before choosing a car. Retailers could appeal a model&apos;s
          band.
        </Typography.Paragraph>
        <Typography.Paragraph className="max-w-prose" color="muted">
          The paper sets out two options. Both span $30,000 from the largest
          rebate to the largest surcharge. Three bands are simpler to run, but
          cars of similar value either side of a cut-off are treated more
          differently. Five bands narrow that gap, at the cost of more
          administration.
        </Typography.Paragraph>
        <FeebateBands bands={THREE_BANDS} title="Option A: three bands" />
        <FeebateBands bands={FIVE_BANDS} title="Option B: five bands" />
        <Typography.Paragraph color="muted" size="sm">
          Indicative banding by LTA, based on cars registered in 2025.
        </Typography.Paragraph>
      </ReportSection>

      <ReportSection
        caption="Today's gap against the proposed one"
        title="How big a $30,000 spread is"
      >
        <Typography.Paragraph className="max-w-prose" color="muted">
          LTA&apos;s aim is to keep a meaningful difference between what
          mass-market and luxury buyers pay. Here is the difference its bands
          would set, beside the one Category A and B produce today.
        </Typography.Paragraph>
        <SectionErrorBoundary title="Premium comparison unavailable">
          <Suspense fallback={<SkeletonCard className="h-[320px] w-full" />}>
            <FeebateSpread />
          </Suspense>
        </SectionErrorBoundary>
      </ReportSection>

      <ReportSection title="COE renewals and Category E">
        <Typography.Paragraph className="max-w-prose" color="muted">
          A merged category would have one COE price and one Prevailing Quota
          Premium (PQP) for renewals. Because Category A and B prices have
          converged, LTA says the feebate may not need to apply to renewals, and
          it could consider transitional arrangements for existing owners.
        </Typography.Paragraph>
        <Typography.Paragraph className="max-w-prose" color="muted">
          Category E, the open category, is mostly used for Category B cars
          today. LTA is asking whether to remove it, which would make urgent
          buyers wait for the next exercise, or keep it for cars only, which
          would protect the supply of Category C COEs for goods vehicles.
        </Typography.Paragraph>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CATEGORY_E_OPTIONS.map(({ detail, icon: Icon, title }) => (
            <Card key={title}>
              <Card.Content className="flex flex-row gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-default">
                  <Icon aria-hidden className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <Typography.Paragraph weight="semibold">
                    {title}
                  </Typography.Paragraph>
                  <Typography.Paragraph color="muted" size="sm">
                    {detail}
                  </Typography.Paragraph>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      </ReportSection>

      <ReportSection title="Timeline">
        {/* A rail of dots: horizontal from `lg`, a vertical rail below it. */}
        <ol className="grid grid-cols-1 gap-6 border-border border-l-2 pl-6 lg:grid-cols-4 lg:border-t-2 lg:border-l-0 lg:pt-6 lg:pl-0">
          {MILESTONES.map(({ date, detail, label }) => (
            <li className="relative flex flex-col gap-2" key={label}>
              <span
                aria-hidden
                className={cn(
                  "absolute top-1 -left-[32px] size-3.5 rounded-full lg:-top-[32px] lg:left-0",
                  label === "Feedback closes" ? "bg-danger" : "bg-accent",
                )}
              />
              <ReportEyebrow>{date}</ReportEyebrow>
              <Typography.Paragraph weight="semibold">
                {label}
              </Typography.Paragraph>
              <Typography.Paragraph color="muted" size="sm">
                {detail}
              </Typography.Paragraph>
            </li>
          ))}
        </ol>
      </ReportSection>

      <ReportSection title="Have your say">
        <Typography.Paragraph className="max-w-prose" color="muted">
          LTA is collecting feedback on whether Categories A and B should merge,
          how the feebate should be designed, whether it should apply to
          renewals, and what should happen to Category E.
        </Typography.Paragraph>
        <div className="flex flex-wrap gap-3">
          <a
            className={buttonVariants({ variant: "primary" })}
            href={FEEDBACK_URL}
            rel="noreferrer"
            target="_blank"
          >
            Give feedback to LTA
            <ArrowUpRight className="size-4" />
          </a>
          <a
            className={buttonVariants({ variant: "secondary" })}
            href={CONSULTATION_PAPER_URL}
            rel="noreferrer"
            target="_blank"
          >
            Read the consultation paper
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </ReportSection>

      <CategoryMergerFaq faqs={CATEGORY_MERGER_FAQS} />

      <ReportNote title="About this page">
        <Typography.Paragraph color="muted" size="sm">
          This page summarises LTA&apos;s consultation paper on COE
          categorisation for cars, published on 8 October 2026. The proposal,
          band options and model examples are LTA&apos;s; MotorMetrics has no
          part in the review. Figures may change once LTA concludes it.
        </Typography.Paragraph>
      </ReportNote>
    </Report>
  );
}
