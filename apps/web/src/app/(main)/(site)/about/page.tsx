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
import { LOGO_URL, SITE_TITLE, SITE_URL } from "@web/config";
import { brandSameAs, SOCIAL_HANDLE } from "@web/config/socials";
import { socialLinks } from "@web/flags";
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
    title,
    description,
    url: `${SITE_URL}/about`,
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
    canonical: "/about",
  },
};

export default async function AboutPage() {
  const showSocialLinks = await socialLinks();
  const sameAs = brandSameAs(showSocialLinks);

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

  const organizationSchema: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
    logo: LOGO_URL,
    description:
      "A platform for exploring Singapore car registration statistics, COE bidding results, and market data.",
    ...(sameAs.length > 0 ? { sameAs } : {}),
    founder: {
      "@type": "Person",
      name: "Ru Chern",
      url: "https://ruchern.dev",
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
      <StructuredData data={organizationSchema} />
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
