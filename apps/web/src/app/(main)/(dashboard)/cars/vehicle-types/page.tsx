import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  type CategoryConfig,
  CategoryOverview,
} from "@web/app/(main)/(dashboard)/cars/components/category/category-overview";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

/**
 * The table's description column is authored copy, not data — there is no
 * equivalent of `FUEL_TYPE_LINKS` descriptions for vehicle types, so these are
 * written here. Keys are the values exactly as LTA records them.
 */
const descriptions: Record<string, string> = {
  "Coupe/Convertible": "Two doors, with a fixed or folding roof",
  Hatchback: "Rear door opens onto the cabin, with no separate boot",
  "Multi-purpose Vehicle": "Tall single-volume cabin, usually with a third row",
  "Multi-purpose Vehicle/Station-wagon":
    "MPVs and station-wagons, recorded by LTA as one class",
  Others: "Vehicle types LTA does not report separately",
  Sedan: "Separate enclosed boot behind the cabin",
  "Sports Utility Vehicle": "Raised ride height, often with all-wheel drive",
  "Station-wagon": "Extended roof over the load area, tailgate at the rear",
};

const config: CategoryConfig = {
  title: "Vehicle types",
  apiDataField: "vehicleType",
  singularLabel: "Vehicle type",
  descriptions,
  description:
    "Comprehensive overview of all vehicle types in {month} Singapore car registrations. Compare sedans, hatchbacks, SUVs, MPVs and station-wagons.",
  lede: "The vehicle types behind each month's new car registrations in Singapore.",
  notes: [
    "LTA records the vehicle type at registration, so every car counts once, under the class on its registration record.",
    "Vehicle type does not determine COE category — engine capacity and power output do.",
  ],
  relatedLinks: [
    { href: "/cars/vehicle-types/hatchback", label: "Hatchbacks in detail" },
    { href: "/cars/fuel-types", label: "Fuel types" },
  ],
  urlPath: "/cars/vehicle-types",
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

  const title = "Car Registrations by Vehicle Type";
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
