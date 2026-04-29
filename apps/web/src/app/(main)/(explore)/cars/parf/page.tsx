import { AnimatedSection } from "@web/app/(main)/(explore)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { NewChip } from "@web/components/shared/chips";
import { PAGE_CONTEXTS } from "@web/components/shared/page-contexts";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";
import { AboutParf } from "./components/about-parf";
import { PARFSections } from "./components/parf-sections";

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

export default function PARFCalculatorPage() {
  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}/cars/parf`,
  };

  return (
    <div className="flex flex-col gap-4">
      <StructuredData data={structuredData} />
      <DashboardPageHeader
        title={
          <DashboardPageTitle
            title="PARF Calculator"
            subtitle="Compare PARF rebates before and after the Budget 2026 changes."
            badge={<NewChip />}
          />
        }
      />
      <AnimatedSection order={1}>
        <AboutParf {...PAGE_CONTEXTS.parf} />
      </AnimatedSection>
      <AnimatedSection order={2}>
        <PARFSections />
      </AnimatedSection>
      <AnimatedSection order={4}>
        <p className="text-center text-default-600 text-xs">
          Figures are for illustration only. The PARF rebate is subject to the
          vehicle&apos;s actual ARF paid and age at deregistration. New rates
          apply to vehicles registered with COEs obtained from the 2nd bidding
          exercise in February 2026 onwards. Source:{" "}
          <a
            href="https://www.lta.gov.sg/content/ltagov/en/newsroom/2026/2/news-releases/revision-parf-rebate-schedule-cap.html"
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            LTA
          </a>
          .
        </p>
      </AnimatedSection>
    </div>
  );
}
