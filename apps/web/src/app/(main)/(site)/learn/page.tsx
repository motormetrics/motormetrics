import { Typography } from "@heroui/react";
import { DataSourcesSection } from "@web/app/(main)/(site)/learn/components/data-sources-section";
import { FAQ_SECTIONS } from "@web/app/(main)/(site)/learn/components/faq-data";
import { FAQSection } from "@web/app/(main)/(site)/learn/components/faq-section";
import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import { GlossarySection } from "@web/app/(main)/(site)/learn/components/glossary-section";
import { GuidesSection } from "@web/app/(main)/(site)/learn/components/guides-section";
import { GUIDE_TOPICS, GUIDES } from "@web/app/(main)/(site)/learn/lib/guides";
import { HeadTitle } from "@web/components/shared/head-grid";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { RelatedLinks } from "@web/components/shared/page-layout";
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

const JUMP_LINKS = [
  ...GUIDE_TOPICS.map(({ id, title }) => ({ href: `#${id}`, label: title })),
  { href: "#glossary", label: "Glossary" },
  { href: "#faq", label: "FAQ" },
  { href: "#data-sources", label: "Where the data comes from" },
];

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

      <OverviewPage className="gap-8 max-md:gap-6">
        {/* The head, then the links down the page. Everything on this page
            is fixed content, so all of it is in the static shell. */}
        <div className="flex flex-col gap-4">
          <HeadTitle
            eyebrow="Guides"
            title="Learn how car ownership costs actually work"
          />
          <Typography.Paragraph className="max-w-prose">
            COE, ARF, OMV, PARF and PQP, in plain language: the rules that set
            the price of a car in Singapore, with worked examples.
          </Typography.Paragraph>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Typography.Paragraph
              className="max-w-prose tabular-nums"
              color="muted"
              size="sm"
            >
              {GUIDES.length} guides, grouped by topic. Figures in each guide
              link back to the live data pages. Source: LTA via DataMall.
            </Typography.Paragraph>
            <div className="sm:ml-auto">
              <SharePill contentType="guide" title={title} />
            </div>
          </div>
          <nav aria-label="On this page">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {JUMP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a
                    className="font-medium text-accent no-underline transition-colors hover:text-accent"
                    href={href}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <Hairline />
        <GuidesSection />
        <Hairline />
        <GlossarySection />
        <Hairline />
        <FAQSection />
        <Hairline />
        <DataSourcesSection />
        <RelatedLinks
          links={[
            { href: "/coe", label: "Bidding results" },
            { href: "/coe/pqp", label: "PQP rates" },
            { href: "/cars", label: "New registrations" },
            { href: "/cars/parf", label: "PARF calculator" },
            { href: "/blog", label: "Blog" },
          ]}
        />
      </OverviewPage>
    </>
  );
}
