import { slugify } from "@motormetrics/utils";
import {
  TypeDetail,
  type TypeDetailConfig,
} from "@web/app/(main)/(dashboard)/cars/components/category/type-detail";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import {
  checkVehicleTypeIfExist,
  getDistinctVehicleTypes,
} from "@web/queries/cars";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

const config: TypeDetailConfig = {
  category: "vehicle-types",
  description:
    "cars registrations by month. Explore registration trends, statistics and distribution by vehicle type for the month in Singapore.",
};

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  params,
}: Pick<PageProps, "params">): Promise<Metadata> {
  const { type } = await params;

  const result = await checkVehicleTypeIfExist(type);
  const displayName = result?.vehicleType ?? type;

  const title = `${displayName} Cars in Singapore`;
  const description = `${displayName} car registrations in Singapore. Explore registration trends, statistics, and distribution by vehicle type for each month.`;
  const canonical = `/cars/vehicle-types/${type}`;
  const images = `/api/og?title=${encodeURIComponent(displayName)}&subtitle=${encodeURIComponent("Stats by Vehicle Type")}`;

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
  const vehicleTypes = await getDistinctVehicleTypes();
  const params = vehicleTypes.map(({ vehicleType }) => ({
    type: slugify(vehicleType),
  }));

  return params.length > 0 ? params : [{ type: "__static-validation__" }];
}

export default function Page({ params, searchParams }: PageProps) {
  return (
    <TypeDetail config={config} params={params} searchParams={searchParams} />
  );
}
