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
import { CtaSection } from "./components/cta-section";
import { DataSourcesSection } from "./components/data-sources-section";
import { FAQ_SECTIONS } from "./components/faq-data";
import { FAQSection } from "./components/faq-section";
import { GLOSSARY_CATEGORIES } from "./components/glossary-data";
import { GlossarySection } from "./components/glossary-section";
import { GuidesSection } from "./components/guides-section";
import { HeroSection } from "./components/hero-section";
import { QuickNavSection } from "./components/quick-nav-section";

const title = "Learn";
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
      <div className="flex flex-col">
        <HeroSection />
        <QuickNavSection />
        <FAQSection />
        <GlossarySection />
        <DataSourcesSection />
        <GuidesSection />
        <CtaSection />
      </div>
    </>
  );
}
