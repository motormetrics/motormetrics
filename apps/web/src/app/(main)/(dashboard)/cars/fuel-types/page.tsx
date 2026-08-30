import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  type CategoryConfig,
  CategoryOverview,
} from "@web/app/(main)/(dashboard)/cars/components/category/category-overview";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { FUEL_TYPE_LINKS, SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

/**
 * The table's description column is authored copy, not data. Reusing the
 * navigation descriptions keeps one wording per fuel type across the site;
 * `Others` has no navigation entry because it has no detail page worth linking.
 */
const descriptions: Record<string, string> = {
  ...Object.fromEntries(
    FUEL_TYPE_LINKS.filter(({ description }) => description).map(
      ({ description, label }) => [label, description as string],
    ),
  ),
  Others: "Fuel types LTA does not report separately",
};

const config: CategoryConfig = {
  title: "Fuel types",
  apiDataField: "fuelType",
  singularLabel: "Fuel type",
  descriptions,
  description:
    "Comprehensive overview of all fuel types in {month} Singapore car registrations. Compare petrol, diesel, electric and petrol-electric registrations.",
  lede: "The fuel types behind each month's new car registrations in Singapore.",
  notes: [
    "LTA records the fuel type at registration, and reports plug-in hybrids separately from the hybrids that only charge themselves. Only battery-electric cars count as Electric.",
    "Figures here are new registrations, not the fleet on the road — the population mix shifts far more slowly.",
  ],
  relatedLinks: [
    { href: "/cars/fuel-types/electric", label: "Electric in detail" },
    { href: "/cars/vehicle-types", label: "Vehicle types" },
  ],
  urlPath: "/cars/fuel-types",
};

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");
  const formattedMonth = formatDateToMonthYear(month);

  const title = "Car Registrations by Fuel Type";
  const description = config.description.replace("{month}", formattedMonth);
  const canonical = config.urlPath;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
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
      canonical,
    },
  };
}

export default function Page({ searchParams }: PageProps) {
  return <CategoryOverview config={config} searchParams={searchParams} />;
}
