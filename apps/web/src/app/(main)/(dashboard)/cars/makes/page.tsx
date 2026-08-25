import { PageHead } from "@web/components/v2/page-head";
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
    <>
      <PageHead
        controls={<MakesHeaderMeta />}
        eyebrow={
          <>Car makes&ensp;·&ensp;registrations by brand, from LTA DataMall</>
        }
        title="Makes"
      />
      <MakesContentSection searchParams={searchParams} />
    </>
  );
}
