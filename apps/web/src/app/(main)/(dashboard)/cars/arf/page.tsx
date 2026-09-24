import { Typography } from "@heroui/react";
import { ARFCalculator } from "@web/app/(main)/(dashboard)/cars/arf/components/arf-calculator";
import { ARFTierTable } from "@web/app/(main)/(dashboard)/cars/arf/components/arf-tier-table";
import { PageHead } from "@web/components/shared/page-head";
import { Report } from "@web/components/shared/report";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
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
    <Report>
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
        description="The ARF on a car is charged in bands of its OMV, with a higher rate on each band. Enter the OMV to see what each band adds."
        title="ARF calculator"
      />

      <ARFCalculator />
      <ARFTierTable />

      <Typography.Paragraph color="muted" size="sm">
        Figures are for illustration only and are before any VES or EEAI rebate
        or surcharge. The ARF you pay is what{" "}
        <Link className="font-bold text-accent-strong" href="/cars/parf">
          your PARF rebate
        </Link>{" "}
        is worked out from, and the{" "}
        <Link className="font-bold text-accent-strong" href="/learn/arf">
          ARF guide
        </Link>{" "}
        explains how it fits into the price of a car. Source:{" "}
        <Link
          className="font-bold text-accent-strong"
          href="https://onemotoring.lta.gov.sg/content/onemotoring/home/buying/upfront-vehicle-costs/tax-structure.html"
          rel="noreferrer"
          target="_blank"
        >
          LTA
        </Link>
        .
      </Typography.Paragraph>
    </Report>
  );
}
