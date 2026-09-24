import { Skeleton } from "@heroui/react";
import { MakesContentSection } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-content-section";
import { RangeMenu } from "@web/app/(main)/(dashboard)/cars/makes/components/range-menu";
import { OverviewPage } from "@web/components/shared/overview";
import { PageEyebrow } from "@web/components/shared/page-eyebrow";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

const title = "Car Makes in Singapore";
const description =
  "Comprehensive overview of car makes in Singapore. Explore popular brands, discover all available manufacturers, and view registration trends and market statistics.";

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Makes",
  description,
  url: `${SITE_URL}/cars/makes`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}/cars/makes`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/cars/makes",
  },
};

export default function CarMakesPage({ searchParams }: PageProps) {
  return (
    <OverviewPage>
      <PageEyebrow
        control={
          <Suspense fallback={<Skeleton className="h-6 w-28 rounded-full" />}>
            <RangeMenu />
          </Suspense>
        }
        section="Cars · Makes"
        title="Makes"
      />
      <StructuredData data={structuredData} />
      <MakesContentSection searchParams={searchParams} />
    </OverviewPage>
  );
}
