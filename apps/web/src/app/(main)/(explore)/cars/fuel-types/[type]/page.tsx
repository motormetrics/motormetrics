import { slugify } from "@motormetrics/utils";
import {
  loadTypeSearchParams,
  TypeDetail,
  type TypeDetailConfig,
} from "@web/app/(main)/(explore)/cars/components/category/type-detail";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { checkFuelTypeIfExist, getDistinctFuelTypes } from "@web/queries/cars";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

const config: TypeDetailConfig = {
  category: "fuel-types",
  description:
    "cars registrations by month. Explore registration trends, statistics and distribution by fuel type for the month in Singapore.",
};

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { type } = await params;
  const { month: parsedMonth } = await loadTypeSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  const result = await checkFuelTypeIfExist(type);
  const displayName = result?.fuelType ?? type;

  const title = `${displayName} Cars in Singapore`;
  const description = `${displayName} car registrations in Singapore. Explore registration trends, statistics, and distribution by fuel type for each month.`;
  const canonical = `/cars/fuel-types/${type}?month=${month}`;
  const images = `/api/og?title=${encodeURIComponent(displayName)}&subtitle=${encodeURIComponent("Stats by Fuel Type")}`;

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
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SOCIAL_HANDLE,
      creator: SOCIAL_HANDLE,
      images,
    },
    alternates: {
      canonical,
    },
  };
}

export async function generateStaticParams() {
  const fuelTypes = await getDistinctFuelTypes();
  const params = fuelTypes.map(({ fuelType }) => ({ type: slugify(fuelType) }));

  return params.length > 0 ? params : [{ type: "__static-validation__" }];
}

export default function Page({ params, searchParams }: PageProps) {
  return (
    <TypeDetail config={config} params={params} searchParams={searchParams} />
  );
}
