import { AnimatedSection } from "@web/app/[locale]/(main)/(dashboard)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { MakesContentSection } from "./components/makes-content-section";
import { MakesHeaderMeta } from "./components/makes-header-meta";

const title = "Car Makes in Singapore";
const description =
  "Comprehensive overview of car makes in Singapore. Explore popular brands, discover all available manufacturers, and view registration trends and market statistics.";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/cars/makes`,
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
    canonical: "/cars/makes",
  },
};

export default function CarMakesPage({ searchParams }: PageProps) {
  return (
    <div className="flex flex-col gap-4">
      <DashboardPageHeader
        title={
          <DashboardPageTitle
            title="Makes"
            subtitle="List of car makes registered in Singapore."
          />
        }
        meta={<MakesHeaderMeta searchParams={searchParams} />}
      />
      <AnimatedSection order={1}>
        <MakesContentSection />
      </AnimatedSection>
    </div>
  );
}
