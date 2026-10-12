import { slugify } from "@motormetrics/utils/slugify";
import { typeDetailMeta } from "@web/app/(main)/(dashboard)/cars/components/type-meta";
import { VehicleTypeReport } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-report";
import { SITE_URL } from "@web/config";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import {
  checkVehicleTypeIfExist,
  getDistinctVehicleTypes,
} from "@web/queries/cars";
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

  const result = await checkVehicleTypeIfExist(type);
  const { title, description, canonical } = typeDetailMeta(
    "vehicle-types",
    type,
    result?.vehicleType,
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
  const vehicleTypes = await getDistinctVehicleTypes();
  const params = vehicleTypes.map(({ vehicleType }) => ({
    type: slugify(vehicleType),
  }));

  return params.length > 0 ? params : [{ type: "__static-validation__" }];
}

export default function Page({ params, searchParams }: PageProps) {
  return <VehicleTypeReport params={params} searchParams={searchParams} />;
}
