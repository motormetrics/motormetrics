import { slugify } from "@motormetrics/utils/slugify";
import {
  TypeDetail,
  type TypeDetailConfig,
} from "@web/app/(main)/(dashboard)/cars/components/category/type-detail";
import { SITE_URL } from "@web/config";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { checkFuelTypeIfExist, getDistinctFuelTypes } from "@web/queries/cars";
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
}: Pick<PageProps, "params">): Promise<Metadata> {
  const { type } = await params;

  const result = await checkFuelTypeIfExist(type);
  const displayName = result?.fuelType ?? type;

  const title = `${displayName} Cars in Singapore`;
  const description = `${displayName} car registrations in Singapore. Explore registration trends, statistics, and distribution by fuel type for each month.`;
  const canonical = `/cars/fuel-types/${type}`;
  return {
    title,
    description,
    openGraph: {
      ...baseOpenGraph,
      title,
      description,
      url: `${SITE_URL}${canonical}`,
    },
    twitter: {
      ...baseTwitter,
      title,
      description,
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
