import { PARFCalculator } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-calculator";
import { PARFComparisonTable } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-comparison-table";
import { PageHead } from "@web/components/shared/page-head";
import { Report } from "@web/components/shared/report";
import { StructuredData } from "@web/components/structured-data";
import Typography from "@web/components/typography";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import type { WebPage, WithContext } from "schema-dts";

const title = "PARF Rebate Calculator Singapore";
const description =
  "Compare PARF rebates before and after the Budget 2026 changes. Calculate how much less you would receive under the new rates.";
const images = `${SITE_URL}/opengraph-image.png`;

export function generateMetadata(): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/cars/parf`,
      siteName: SITE_TITLE,
      locale: "en_SG",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SOCIAL_HANDLE,
      creator: SOCIAL_HANDLE,
      images,
    },
    alternates: {
      canonical: "/cars/parf",
    },
  };
}

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
        description="What a deregistration returns under the Budget 2026 rebate schedule, and how much that is short of the old one."
        title="PARF calculator"
      />

      <PARFCalculator />
      <PARFComparisonTable />

      <Typography.TextSm>
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
      </Typography.TextSm>
    </Report>
  );
}
