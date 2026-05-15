import { StructuredData } from "@web/components/structured-data";
import { LOGO_URL, SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE, SOCIAL_URLS } from "@web/config/socials";
import type { Metadata } from "next";
import type { Organization, Person, WebPage, WithContext } from "schema-dts";
import { CreatorSection } from "./components/creator-section";
import { CtaSection } from "./components/cta-section";
import { DataSection } from "./components/data-section";
import { HeroSection } from "./components/hero-section";
import { MissionSection } from "./components/mission-section";
import { StatsSection } from "./components/stats-section";
import { TimelineSection } from "./components/timeline-section";

const title = `About ${SITE_TITLE}`;
const description = `Learn about ${SITE_TITLE}, a platform for exploring Singapore car registration statistics, COE bidding results, and market data. Built to make car market information easier to find and understand.`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} - ${SITE_TITLE}`,
    description,
    url: `${SITE_URL}/about`,
    siteName: SITE_TITLE,
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} - ${SITE_TITLE}`,
    description,
    site: SOCIAL_HANDLE,
    creator: SOCIAL_HANDLE,
  },
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage() {
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
    sameAs: [SOCIAL_URLS.instagram, SOCIAL_URLS.telegram, SOCIAL_URLS.github],
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

  return (
    <>
      <StructuredData data={webPageSchema} />
      <StructuredData data={organizationSchema} />
      <StructuredData data={personSchema} />

      <div className="flex flex-col">
        <HeroSection />
        <StatsSection />
        <MissionSection />
        <DataSection />
        <TimelineSection />
        <CreatorSection />
        <CtaSection />
      </div>
    </>
  );
}
