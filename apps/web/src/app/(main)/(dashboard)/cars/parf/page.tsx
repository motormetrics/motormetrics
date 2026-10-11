import { Typography } from "@heroui/react";
import { PARFCalculator } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-calculator";
import { OverviewPage } from "@web/components/shared/overview";
import { PageHead } from "@web/components/shared/page-head";
import { ReportSection } from "@web/components/shared/report";
import { Text } from "@web/components/shared/text";
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

      <PageHead
        eyebrow="Calculator"
        sub={
          <>
            Budget 2026 rebate schedule, effective from the{" "}
            <span className="font-semibold text-foreground">
              Second bidding, February 2026
            </span>{" "}
            · Source: LTA
          </>
        }
        title="PARF rebate calculator"
      />

      <PARFCalculator />

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
        <Text.Paragraph tone="strong">
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
        </Text.Paragraph>
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
    </OverviewPage>
  );
}
