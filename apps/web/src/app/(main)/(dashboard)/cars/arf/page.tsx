import { Typography } from "@heroui/react";
import { ARFCalculator } from "@web/app/(main)/(dashboard)/cars/arf/components/arf-calculator";
import { ARF_FAQS } from "@web/app/(main)/(dashboard)/cars/arf/components/faq-data";
import { CalculatorTabs } from "@web/app/(main)/(dashboard)/cars/parf/components/calculator-panel";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { RelatedLinks } from "@web/components/shared/page-layout";
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

const title = "ARF Calculator Singapore";
const description =
  "Calculate the Additional Registration Fee (ARF) on a car from its OMV, band by band, using LTA's current tiers or the earlier schedules.";
export function generateMetadata(): Metadata {
  return {
    title,
    description,
    openGraph: {
      ...baseOpenGraph,
      title,
      description,
      url: `${SITE_URL}/cars/arf`,
    },
    twitter: {
      ...baseTwitter,
      title,
      description,
    },
    alternates: {
      canonical: "/cars/arf",
    },
  };
}

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description,
  url: `${SITE_URL}/cars/arf`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

export default function ARFCalculatorPage() {
  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "ARF", path: "/cars/arf" },
          ]),
        }}
      />

      <PageHead
        sub="Estimates only, not financial advice"
        title="ARF calculator"
      />

      <Hairline />

      <CalculatorTabs current="arf" />

      <ARFCalculator />

      <Hairline />

      <section className="flex scroll-mt-20 flex-col gap-4" id="arf-notes">
        <SectionHead
          eyebrow="Before you rely on it"
          title="What the figures assume"
        />
        <Typography.Paragraph color="muted" size="sm">
          Current tiers apply to COEs from the{" "}
          <span className="font-semibold text-foreground">
            2nd bidding exercise, February 2023
          </span>{" "}
          · Source: LTA
        </Typography.Paragraph>
        <Typography.Paragraph className="max-w-prose">
          Figures are for illustration only and are before any VES or EEAI
          rebate or surcharge. LTA charges the ARF on the car&apos;s OMV, band
          by band, at the rates in force when its COE was obtained. The ARF you
          pay is what{" "}
          <Link className="font-semibold text-accent" href="/cars/parf">
            your PARF rebate
          </Link>{" "}
          is worked out from, and the{" "}
          <Link className="font-semibold text-accent" href="/learn/arf">
            ARF guide
          </Link>{" "}
          explains how it fits into the price of a car.
        </Typography.Paragraph>
        <SourceNote>
          Estimates only, not financial advice or a recommendation. MotorMetrics
          is not affiliated with LTA; check your figures on OneMotoring.
        </SourceNote>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <SectionLink
            className="ml-0"
            href="https://onemotoring.lta.gov.sg/content/onemotoring/home/buying/upfront-vehicle-costs/tax-structure.html"
            rel="noopener noreferrer nofollow"
          >
            LTA tax structure
          </SectionLink>
          <SectionLink className="ml-0" href="/cars/parf">
            PARF calculator
          </SectionLink>
          <SectionLink className="ml-0" href="/coe/results">
            COE premiums
          </SectionLink>
        </div>
      </section>

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: ARF_FAQS }]),
        }}
      />
      <PageFaq faqs={ARF_FAQS} />

      <RelatedLinks
        links={[
          { href: "/cars/parf", label: "PARF calculator" },
          { href: "/cars", label: "New registrations" },
          { href: "/learn", label: "Guides" },
        ]}
      />
    </OverviewPage>
  );
}
