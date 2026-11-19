import {
  loadMakeRows,
  summariseLeaders,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  FuelMixFigure,
  RoadFigure,
  TopMakesFigure,
} from "@web/app/(main)/(dashboard)/components/car-figures";
import {
  CarCategoriesTrendFigure,
  CoePremiumsFigure,
} from "@web/app/(main)/(dashboard)/components/coe-figures";
import { buildHomeFaqs } from "@web/app/(main)/(dashboard)/components/faq-data";
import {
  MarketAsOf,
  NewCarsKeyNumbers,
  PqpKeyNumbers,
} from "@web/app/(main)/(dashboard)/components/market-head";
import { MarketLinks } from "@web/app/(main)/(dashboard)/components/market-links";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { PageBody, RelatedLinks } from "@web/components/shared/page-layout";
import { StructuredData } from "@web/components/structured-data";
import { LOGO_URL, SITE_TITLE, SITE_URL, SUPPORT_EMAIL } from "@web/config";
import { BRAND_SOCIAL_PROFILE_URLS } from "@web/config/socials";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: `${SITE_TITLE} (formerly SG Cars Trends)` },
  description:
    "Track Singapore car registration trends, COE bidding results, and automotive market insights. Latest data from Land Transport Authority (LTA) with interactive charts, EV and hybrid statistics, and AI-powered analysis.",
  keywords: [
    "Singapore car registration",
    "COE prices",
    "car trends Singapore",
    "vehicle statistics",
    "electric vehicles Singapore",
    "hybrid cars",
    "LTA data",
  ],
  openGraph: {
    ...baseOpenGraph,
    title: `${SITE_TITLE} (formerly SG Cars Trends)`,
    description:
      "Track Singapore car registration trends and COE bidding results with interactive charts and latest market insights.",
    url: SITE_URL,
  },
  twitter: {
    ...baseTwitter,
    title: `${SITE_TITLE} (formerly SG Cars Trends)`,
    description:
      "Track Singapore car registration trends and COE bidding results with interactive charts.",
  },
  alternates: {
    canonical: "/",
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_TITLE,
  url: SITE_URL,
  description:
    "Analysis of new car registration trends in Singapore. Insights on popular makes, fuel and vehicle types, COE bidding results, and market data.",
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/cars/makes?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;

function OrganizationStructuredData() {
  const sameAs = [...BRAND_SOCIAL_PROFILE_URLS];

  return (
    <StructuredData
      data={{
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
      }}
    />
  );
}

/** The questions and their FAQPage schema, with the leading makes quoted. */
async function HomeFaq() {
  const { latestMonth, rows } = await loadMakeRows("ytd", null);
  const faqs = buildHomeFaqs(summariseLeaders(rows, latestMonth, "ytd"));

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: faqs }]),
        }}
      />
      <PageFaq faqs={faqs} />
    </>
  );
}

export default function HomePage() {
  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      <StructuredData data={webSiteSchema} />
      <OrganizationStructuredData />

      {/* The home page always reports the latest month and exercise: it has
          no month parameter, so the head carries no scope control and the
          sidebar no filters. Everything here reads cached data only, so it is
          all part of the static shell and no section needs a Suspense
          boundary. */}
      <PageHead sub={<MarketAsOf />} title="Singapore car market" />

      <PageBody
        rail={
          <>
            <SectionErrorBoundary title="PQP rates unavailable">
              <PqpKeyNumbers />
            </SectionErrorBoundary>
            <SectionErrorBoundary title="Key numbers unavailable">
              <NewCarsKeyNumbers />
            </SectionErrorBoundary>
          </>
        }
      >
        {/* COE leads the car figures, as the navigation does. */}
        <SectionErrorBoundary title="COE premiums unavailable">
          <CoePremiumsFigure />
        </SectionErrorBoundary>
        <Hairline />
        <SectionErrorBoundary title="Category A and B premiums unavailable">
          <CarCategoriesTrendFigure />
        </SectionErrorBoundary>
        <Hairline />
        <SectionErrorBoundary title="Fuel types unavailable">
          <FuelMixFigure />
        </SectionErrorBoundary>
        <Hairline />
        <SectionErrorBoundary title="Leading makes unavailable">
          <TopMakesFigure />
        </SectionErrorBoundary>
      </PageBody>

      {/* Sections the artboard does not draw sit below the two columns, so
          that on a narrow screen the key figures come before them. */}
      <PageBody>
        <Hairline />
        <SectionErrorBoundary title="Vehicle figures unavailable">
          <RoadFigure />
        </SectionErrorBoundary>

        <MarketLinks />

        <HomeFaq />
      </PageBody>

      <RelatedLinks
        links={[
          { href: "/coe", label: "COE bidding results" },
          { href: "/coe/pqp", label: "PQP rates" },
          { href: "/cars", label: "New registrations" },
          { href: "/cars/makes", label: "Makes" },
          { href: "/learn", label: "Guides" },
        ]}
      />
    </OverviewPage>
  );
}
