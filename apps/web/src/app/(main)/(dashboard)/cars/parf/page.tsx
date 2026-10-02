import { Typography } from "@heroui/react";
import { PARFCalculator } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-calculator";
import { PARFComparisonTable } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-comparison-table";
import { PageHead } from "@web/components/shared/page-head";
import { Report, ReportSection } from "@web/components/shared/report";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import Link from "next/link";
import type { WebPage, WithContext } from "schema-dts";

const title = "PARF Rebate Calculator and 2026 Rates";
const description =
  "Work out your PARF rebate, COE rebate and deregistration value. Budget 2026 cut the PARF rates from 75% to 30% of ARF and halved the cap to $30,000.";
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
    <Report>
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

      <PageHead
        description="The PARF rebate is the part of your ARF you get back when you deregister a car before it turns 10. See what it returns under the Budget 2026 schedule, how much that is short of the old one, and your car's deregistration value once the COE rebate is added."
        title="PARF rebate calculator"
      />

      <PARFCalculator />
      <PARFComparisonTable />

      <ReportSection title="Who gets a PARF rebate">
        <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-strong">
          <li>
            The car was registered brand new, or as a used import no more than 3
            years old after 1 September 2007.
          </li>
          <li>It is no more than 10 years old when deregistered.</li>
          <li>
            It has never been laid up, and its COE has never been renewed.
          </li>
        </ul>
        <Typography.Paragraph className="text-muted-strong">
          Your deregistration value is the PARF rebate plus a COE rebate for the
          months left on the COE.{" "}
          <Link
            className="font-bold text-accent-strong"
            href="/learn/check-parf-rebate"
          >
            How to check your PARF rebate on OneMotoring
          </Link>{" "}
          covers both, and the{" "}
          <Link className="font-bold text-accent-strong" href="/learn/parf">
            PARF guide
          </Link>{" "}
          explains when deregistering early pays off.
        </Typography.Paragraph>
      </ReportSection>

      <Typography.Paragraph color="muted" size="sm">
        Figures are for illustration only. The PARF rebate is subject to the
        vehicle&apos;s actual ARF paid and its age at deregistration. The new
        rates apply to vehicles registered with COEs obtained from the 2nd
        bidding exercise in February 2026 onwards. Source:{" "}
        <Link
          className="font-bold text-accent-strong"
          href="https://www.lta.gov.sg/content/ltagov/en/newsroom/2026/2/news-releases/revision-parf-rebate-schedule-cap.html"
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
