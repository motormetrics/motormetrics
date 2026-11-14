import { Typography } from "@heroui/react";
import { DataSourcesSection } from "@web/app/(main)/(site)/learn/components/data-sources-section";
import { FAQ_SECTIONS } from "@web/app/(main)/(site)/learn/components/faq-data";
import { FAQSection } from "@web/app/(main)/(site)/learn/components/faq-section";
import { FeaturedGuide } from "@web/app/(main)/(site)/learn/components/featured-guide";
import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import { GlossarySection } from "@web/app/(main)/(site)/learn/components/glossary-section";
import { GuidesSection } from "@web/app/(main)/(site)/learn/components/guides-section";
import { LearnKeyNumbers } from "@web/app/(main)/(site)/learn/components/learn-key-numbers";
import { GUIDES } from "@web/app/(main)/(site)/learn/lib/guides";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateDefinedTermSetSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import {
  baseOpenGraph,
  baseTwitter,
  learnCardImages,
} from "@web/lib/metadata/social";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";

const title = "Car & COE Guides";
const description =
  "Educational hub for Singapore's automotive market — FAQs, glossary of key terms, data sources, and guides to understanding COE, PARF, and car registration trends.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    images: learnCardImages,
    title,
    description,
    url: `${SITE_URL}/learn`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/learn",
  },
};

export default function LearnPage() {
  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}/learn`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };

  const faqSchema = generateFAQPageSchema(FAQ_SECTIONS);
  const glossarySchema = generateDefinedTermSetSchema(GLOSSARY_CATEGORIES);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Learn", path: "/learn" },
  ]);

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{ "@context": "https://schema.org", ...faqSchema }}
      />
      <StructuredData
        data={{ "@context": "https://schema.org", ...glossarySchema }}
      />
      <StructuredData
        data={{ "@context": "https://schema.org", ...breadcrumbSchema }}
      />

      <OverviewPage className="gap-10 max-md:gap-7">
        {/* Direction D's head, with the key numbers beside it once the page
            is wide and under it before then. Everything on this page is
            fixed content, so all of it is in the static shell. */}
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
                  Guides
                </Typography.Paragraph>
                <Typography.Heading level={1}>
                  Learn how car ownership costs actually work
                </Typography.Heading>
              </div>
              <Typography.Paragraph className="max-w-prose">
                COE, ARF, OMV, PARF and PQP, in plain language: the rules that
                set the price of a car in Singapore, with worked examples.
              </Typography.Paragraph>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
                <Typography.Paragraph
                  className="max-w-prose tabular-nums"
                  color="muted"
                  size="sm"
                >
                  {GUIDES.length} guides, grouped by topic. Figures in each
                  guide link back to the live data pages. Source: LTA via
                  DataMall.
                </Typography.Paragraph>
                <div className="sm:ml-auto">
                  <SharePill contentType="guide" title={title} />
                </div>
              </div>
            </div>
            <LearnKeyNumbers />
          </div>
        </div>
        <Hairline />
        <FeaturedGuide />
        <Hairline />
        <GuidesSection />
        <Hairline />
        <GlossarySection />
        <Hairline />
        <FAQSection />
        <Hairline />
        <DataSourcesSection />
      </OverviewPage>
    </>
  );
}
