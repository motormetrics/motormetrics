import { DataSourcesSection } from "@web/app/(main)/(site)/learn/components/data-sources-section";
import { FAQ_SECTIONS } from "@web/app/(main)/(site)/learn/components/faq-data";
import { FAQSection } from "@web/app/(main)/(site)/learn/components/faq-section";
import { FeaturedGuide } from "@web/app/(main)/(site)/learn/components/featured-guide";
import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import { GlossarySection } from "@web/app/(main)/(site)/learn/components/glossary-section";
import { GuidesSection } from "@web/app/(main)/(site)/learn/components/guides-section";
import { LearnStats } from "@web/app/(main)/(site)/learn/components/learn-stats";
import { PageHead } from "@web/components/shared/page-head";
import { SitePage } from "@web/components/shared/site-page";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import {
  generateBreadcrumbSchema,
  generateDefinedTermSetSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";

const title = "Car & COE Guides";
const description =
  "Educational hub for Singapore's automotive market — FAQs, glossary of key terms, data sources, and guides to understanding COE, PARF, and car registration trends.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/learn`,
    siteName: SITE_TITLE,
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    site: SOCIAL_HANDLE,
    creator: SOCIAL_HANDLE,
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

      <SitePage>
        <PageHead
          description="COE, ARF, OMV, PARF and PQP, in plain language — the rules that set the price of a car in Singapore, with worked examples."
          title="Learn how car ownership costs actually work"
        />
        <LearnStats />
        <FeaturedGuide />
        <GuidesSection />
        <GlossarySection />
        <FAQSection />
        <DataSourcesSection />
      </SitePage>
    </>
  );
}
