import { CoeOverview } from "@web/app/(main)/(dashboard)/coe/components/coe-overview";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { generateDataCatalogSchema } from "@web/lib/metadata";
import type { Metadata } from "next";

const title = "COE Bidding Results Singapore";
const description =
  "Certificate of Entitlement (COE) data for Singapore. View premiums, historical results, and PQP rates.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/coe`,
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
    canonical: "/coe",
  },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDataCatalogSchema(
            "Singapore COE Data Catalogue",
            "Certificate of Entitlement bidding results, premium trends, and PQP rates for Singapore's vehicle quota system.",
            "/coe",
            ["coe-results", "coe-premiums", "coe-pqp"],
          ),
        }}
      />
      <CoeOverview />
    </div>
  );
}
