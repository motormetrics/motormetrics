import { Typography } from "@heroui/react";
import { PARF_FAQS } from "@web/app/(main)/(dashboard)/cars/parf/components/faq-data";
import { PARFCalculator } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-calculator";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import Link from "next/link";
import type { WebPage, WithContext } from "schema-dts";

const title = "PARF & COE Rebate Calculator: Estimate Deregistration Value";
const description =
  "Enter ARF, car age and COE left to estimate your PARF rebate, COE rebate and deregistration value under old and Budget 2026 rates. No login needed.";
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}/cars/parf`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/cars/parf",
  },
};

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description,
  url: `${SITE_URL}/cars/parf`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

export default function PARFCalculatorPage() {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "PARF", path: "/cars/parf" },
          ]),
        }}
      />

      <PARFCalculator
        head={
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Typography.Paragraph
                className="uppercase"
                color="muted"
                size="xs"
                weight="semibold"
              >
                Calculator · Budget 2026 rebate schedule
              </Typography.Paragraph>
              <SharePill title="PARF and COE rebate calculator" />
            </div>
            <Typography.Heading level={1}>
              PARF and COE rebate calculator
            </Typography.Heading>
            <Typography.Paragraph color="muted" size="sm">
              Budget 2026 rebate schedule, effective from the{" "}
              <span className="font-semibold text-foreground">
                2nd bidding exercise, February 2026
              </span>{" "}
              · Source: LTA
            </Typography.Paragraph>
          </>
        }
      />

      <Hairline />

      <section className="flex scroll-mt-20 flex-col gap-4" id="parf-notes">
        <SectionHead
          eyebrow="Before you rely on it"
          title="What the figures assume"
        />
        <Typography.Paragraph className="max-w-prose text-muted-strong">
          Figures are for illustration only. The PARF rebate is subject to the
          vehicle&apos;s actual ARF paid and its age at deregistration. The new
          rates apply to vehicles registered with COEs obtained from the 2nd
          bidding exercise in February 2026 onwards, as set out by LTA.{" "}
          <Link
            className="font-semibold text-accent-strong"
            href="/learn/check-parf-rebate"
          >
            How to check your PARF rebate on OneMotoring
          </Link>{" "}
          covers LTA&apos;s exact figure, and the{" "}
          <Link className="font-semibold text-accent-strong" href="/learn/parf">
            PARF guide
          </Link>{" "}
          explains who qualifies.
        </Typography.Paragraph>
        <SourceNote>
          Estimates only, not financial advice or a recommendation. MotorMetrics
          is not affiliated with LTA; check your figures on OneMotoring.
        </SourceNote>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <SectionLink
            className="ml-0"
            href="https://www.lta.gov.sg/content/ltagov/en/newsroom/2026/2/news-releases/revision-parf-rebate-schedule-cap.html"
            rel="noopener noreferrer nofollow"
          >
            LTA announcement
          </SectionLink>
          <SectionLink className="ml-0" href="/cars/arf">
            ARF calculator
          </SectionLink>
          <SectionLink className="ml-0" href="/coe/pqp">
            PQP renewal rates
          </SectionLink>
          <SectionLink className="ml-0" href="/coe/premiums">
            COE premiums
          </SectionLink>
        </div>
      </section>

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: PARF_FAQS }]),
        }}
      />
      <PageFaq faqs={PARF_FAQS} />
    </OverviewPage>
  );
}
