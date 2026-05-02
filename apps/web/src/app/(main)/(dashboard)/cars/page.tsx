import { CarsOverview } from "@web/app/(main)/(dashboard)/cars/components/cars-overview";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { generateDataCatalogSchema } from "@web/lib/metadata";
import type { Metadata } from "next";

const title = "Singapore Car Registration Data";
const description =
  "Explore Singapore vehicle data including new registrations, deregistrations, makes, fuel types, vehicle types, and PARF calculator.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/cars`,
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
    canonical: "/cars",
  },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDataCatalogSchema(
            "Singapore Vehicle Data Catalogue",
            "Comprehensive collection of Singapore vehicle registration, deregistration, and population datasets sourced from the Land Transport Authority.",
            "/cars",
            ["registrations", "deregistrations", "annual", "electric-vehicles"],
          ),
        }}
      />
      <CarsOverview />
    </div>
  );
}
