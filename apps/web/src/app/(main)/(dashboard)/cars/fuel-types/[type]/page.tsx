import { slugify } from "@motormetrics/utils/slugify";
import { typeDetailMeta } from "@web/app/(main)/(dashboard)/cars/components/category/type-detail";
import { FuelTypeReport } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-report";
import { SITE_URL } from "@web/config";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { checkFuelTypeIfExist, getDistinctFuelTypes } from "@web/queries/cars";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  params,
}: Pick<PageProps, "params">): Promise<Metadata> {
  const { type } = await params;

  const result = await checkFuelTypeIfExist(type);
  const { title, description, canonical } = typeDetailMeta(
    "fuel-types",
    type,
    result?.fuelType,
  );
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
  return <FuelTypeReport params={params} searchParams={searchParams} />;
}
