import { Skeleton } from "@heroui/react";
import { OverviewPage } from "@web/components/shared/overview";
import { PageEyebrow } from "@web/components/shared/page-eyebrow";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { MakesContentSection } from "./components/makes-content-section";
import { RangeMenu } from "./components/range-menu";

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
      <MakesContentSection searchParams={searchParams} />
    </OverviewPage>
  );
}
