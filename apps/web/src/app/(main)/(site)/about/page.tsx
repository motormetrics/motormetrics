import { CtaSection } from "@web/app/(main)/(site)/about/components/cta-section";
import { DataSection } from "@web/app/(main)/(site)/about/components/data-section";
import { DatasetsSection } from "@web/app/(main)/(site)/about/components/datasets-section";
import { FAQS } from "@web/app/(main)/(site)/about/components/faq-data";
import { FaqSection } from "@web/app/(main)/(site)/about/components/faq-section";
import { HeroSection } from "@web/app/(main)/(site)/about/components/hero-section";
import { MissionSection } from "@web/app/(main)/(site)/about/components/mission-section";
import { StatsSection } from "@web/app/(main)/(site)/about/components/stats-section";
import { SitePage } from "@web/components/shared/site-page";
import { StructuredData } from "@web/components/structured-data";
import { LOGO_URL, SITE_TITLE, SITE_URL, SUPPORT_EMAIL } from "@web/config";
import { BRAND_SOCIAL_PROFILE_URLS } from "@web/config/socials";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import type {
  FAQPage,
  Organization,
  Person,
  WebPage,
  WithContext,
} from "schema-dts";

const title = `About ${SITE_TITLE} (formerly SG Cars Trends)`;
const description = `Learn about ${SITE_TITLE}, a platform for exploring Singapore car registration statistics, COE bidding results, and market data. Built to make car market information easier to find and understand.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}/about`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/about",
  },
};

function OrganizationStructuredData() {
  const sameAs = [...BRAND_SOCIAL_PROFILE_URLS];
  const organizationSchema: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
    logo: LOGO_URL,
    description:
      "A platform for exploring Singapore car registration statistics, COE bidding results, and market data.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SUPPORT_EMAIL,
      url: `${SITE_URL}/contact`,
    },
    address: { "@type": "PostalAddress", addressCountry: "SG" },
    ...(sameAs.length > 0 ? { sameAs } : {}),
    founder: {
      "@type": "Person",
      name: "Ru Chern",
      url: "https://ruchern.dev",
    },
  };

  return <StructuredData data={organizationSchema} />;
}

export default function AboutPage() {
  const webPageSchema: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${title} - ${SITE_TITLE}`,
    description,
    url: `${SITE_URL}/about`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };

  const personSchema: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ru Chern",
    url: "https://ruchern.dev",
    sameAs: [
      "https://github.com/ruchernchong",
      "https://linkedin.com/in/ruchernchong",
    ],
    knowsAbout: [
      "Software Development",
      "Data Analytics",
      "Singapore Automotive Market",
      "Web Development",
    ],
    jobTitle: "Software Engineer",
  };

  const faqSchema: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ answer, question }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <>
      <StructuredData data={webPageSchema} />
      <OrganizationStructuredData />
      <StructuredData data={personSchema} />
      <StructuredData data={faqSchema} />

      <SitePage>
        <HeroSection />
        <StatsSection />
        <MissionSection />
        <DatasetsSection />
        <DataSection />
        <FaqSection />
        <CtaSection />
      </SitePage>
    </>
  );
}
