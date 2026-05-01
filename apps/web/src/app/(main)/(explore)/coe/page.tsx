import { Link } from "@heroui/react";
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
  // Separate hero card (Premiums) from the rest
  const heroItem = navLinks.coe.find((item) => item.url === "/coe/premiums");
  const sidebarItems = navLinks.coe.filter(
    (item) => item.url !== "/coe/premiums",
  );

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
      <div className="flex flex-col gap-2">
        <Typography.H1>COE</Typography.H1>
        <Typography.TextLg>
          Certificate of Entitlement data and analysis for Singapore. Explore{" "}
          <Link
            href="/cars"
            className="text-accent underline-offset-4 hover:underline"
          >
            car registration data
          </Link>{" "}
          to see which makes and fuel types are most popular.
        </Typography.TextLg>
      </div>

      <AnimatedGrid className="grid grid-cols-12 gap-4">
        {/* Hero card: Premiums - spans 8 columns on desktop */}
        {heroItem?.icon && (
          <AnimatedSection className="col-span-12 md:col-span-8" order={0}>
            <ExploreCard
              title={heroItem.title}
              description={heroItem.description ?? ""}
              href={heroItem.url}
              icon={
                <heroItem.icon
                  className={`size-6 ${heroItem.iconColor ?? "text-accent"}`}
                />
              }
              badge={heroItem.badge}
              variant="hero"
              className="h-full min-h-[200px] md:min-h-[280px]"
            />
          </AnimatedSection>
        )}

        {/* Sidebar: Results and PQP stacked vertically */}
        <div className="col-span-12 flex flex-col gap-4 md:col-span-4">
          {sidebarItems.map((item, index) => (
            <AnimatedSection key={item.url} order={index + 1}>
              <ExploreCard
                title={item.title}
                description={item.description ?? ""}
                href={item.url}
                icon={
                  item.icon && (
                    <item.icon
                      className={`size-5 ${item.iconColor ?? "text-accent"}`}
                    />
                  )
                }
                badge={item.badge}
                variant="standard"
              />
            </AnimatedSection>
          ))}
        </div>
      </AnimatedGrid>
    </div>
  );
}
