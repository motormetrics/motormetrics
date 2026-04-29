import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  type CategoryConfig,
  CategoryOverview,
} from "@web/app/(main)/(explore)/cars/components/category/category-overview";
import { loadSearchParams } from "@web/app/(main)/(explore)/cars/registrations/search-params";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

const config: CategoryConfig = {
  title: "Vehicle Types",
  apiDataField: "vehicleType",
  tabTitle: "Vehicle Type",
  description:
    "Comprehensive overview of all vehicle types in {month} Singapore car registrations. Compare passenger cars, motorcycles, commercial vehicles, and more.",
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

  const title = `${formattedMonth} Vehicle Types`;
  const description = config.description.replace("{month}", formattedMonth);
  const canonical = `${config.urlPath}?month=${month}`;

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
