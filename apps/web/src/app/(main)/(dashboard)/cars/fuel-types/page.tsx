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

const config: CategoryConfig = {
  title: "Fuel Types",
  apiDataField: "fuelType",
  tabTitle: "Fuel Type",
  description:
    "Comprehensive overview of all fuel types in {month} Singapore car registrations. Compare petrol, diesel, electric, and hybrid vehicle registrations.",
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

  const title = `${formattedMonth} Fuel Types`;
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
