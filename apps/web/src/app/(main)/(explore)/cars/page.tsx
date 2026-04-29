import { cn } from "@heroui/theme";
import { AnimatedGrid } from "@web/app/(main)/(explore)/components/animated-grid";
import { AnimatedSection } from "@web/app/(main)/(explore)/components/animated-section";
import { ExploreCard } from "@web/app/(main)/(explore)/components/explore-card";
import { StructuredData } from "@web/components/structured-data";
import Typography from "@web/components/typography";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { navLinks } from "@web/config/navigation";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { generateDataCatalogSchema } from "@web/lib/metadata";
import type { Metadata } from "next";
import Link from "next/link";

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

// Define card layout with variants
const cardLayout: Record<
  string,
  { variant: "hero" | "standard" | "tool"; colSpan: string }
> = {
  "/cars/registrations": {
    variant: "hero",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
  },
  "/cars/deregistrations": {
    variant: "standard",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
  },
  "/cars/makes": {
    variant: "standard",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
  },
  "/cars/fuel-types": {
    variant: "standard",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
  },
  "/cars/vehicle-types": {
    variant: "standard",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
  },
  "/cars/electric-vehicles": {
    variant: "hero",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
  },
  "/cars/annual": {
    variant: "standard",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
  },
  "/cars/parf": {
    variant: "tool",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
  },
  "/cars/costs": {
    variant: "tool",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
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
      <div className="flex flex-col gap-2">
        <Typography.H1>Cars</Typography.H1>
        <Typography.TextLg>
          Explore Singapore vehicle data across registrations, deregistrations,
          and more. Looking for COE data?{" "}
          <Link href="/coe" className="text-primary hover:underline">
            View COE premiums and results
          </Link>
          .
        </Typography.TextLg>
      </div>

      <AnimatedGrid className="grid grid-cols-12 gap-4">
        {navLinks.cars.map(
          (
            { title, url, icon: Icon, description, badge, iconColor },
            index,
          ) => {
            const layout = cardLayout[url] ?? {
              variant: "standard" as const,
              colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
            };
            const isHero = layout.variant === "hero";

            return (
              <AnimatedSection
                key={url}
                className={layout.colSpan}
                order={index}
              >
                <ExploreCard
                  title={title}
                  description={description ?? ""}
                  href={url}
                  icon={
                    Icon && (
                      <Icon
                        className={cn(
                          isHero ? "size-6" : "size-5",
                          iconColor ?? "text-primary",
                        )}
                      />
                    )
                  }
                  badge={badge}
                  variant={layout.variant}
                />
              </AnimatedSection>
            );
          },
        )}
      </AnimatedGrid>
    </div>
  );
}
