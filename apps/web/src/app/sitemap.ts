import { redis } from "@motormetrics/utils/redis";
import { slugify } from "@motormetrics/utils/slugify";
import {
  COMPARE_PAIRS,
  pairSlug,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import { GUIDES } from "@web/app/(main)/(site)/learn/lib/guides";
import {
  LAST_UPDATED_CARS_KEY,
  LAST_UPDATED_COE_KEY,
  SITE_URL,
} from "@web/config";
import {
  getDistinctFuelTypes,
  getDistinctMakes,
  getDistinctVehicleTypes,
} from "@web/queries/cars";
import { getCOELatestMonth } from "@web/queries/coe/latest-month";
import { getAllPosts } from "@web/queries/posts";
import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("max");
  cacheTag("sitemap", "posts:list", "cars:makes", "coe:months");

  const [
    posts,
    makes,
    fuelTypes,
    vehicleTypes,
    coeLatestMonth,
    carsUpdatedAt,
    coeUpdatedAt,
  ] = await Promise.all([
    getAllPosts(),
    getDistinctMakes(),
    getDistinctFuelTypes(),
    getDistinctVehicleTypes(),
    getCOELatestMonth(),
    redis.get<number>(LAST_UPDATED_CARS_KEY),
    redis.get<number>(LAST_UPDATED_COE_KEY),
  ]);
  // The workflows stamp these keys only when an update brought new records,
  // so they are the day the pages last changed, not the day of the last run.
  // The tags above are revalidated by the same workflows, which keeps the
  // dates read here current.
  const carsLastModified = carsUpdatedAt ? new Date(carsUpdatedAt) : undefined;
  // The COE workflow updates PQP alongside the bidding results, so one date
  // covers all four COE pages. A "YYYY-MM" month is a valid W3C datetime and
  // stands in until the first stamped update.
  const coeLastModified = coeUpdatedAt
    ? new Date(coeUpdatedAt)
    : (coeLatestMonth ?? undefined);
  // The overview leads with both datasets, so it changes when either does.
  const homeLastModified =
    carsUpdatedAt || coeUpdatedAt
      ? new Date(Math.max(carsUpdatedAt ?? 0, coeUpdatedAt ?? 0))
      : undefined;

  return [
    {
      url: SITE_URL,
      lastModified: homeLastModified,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: "weekly" as const,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.modifiedAt,
      changeFrequency: "weekly" as const,
    })),
    {
      url: `${SITE_URL}/cars`,
      lastModified: carsLastModified,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/registrations`,
      lastModified: carsLastModified,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/fuel-types`,
      lastModified: carsLastModified,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/vehicle-types`,
      lastModified: carsLastModified,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/makes`,
      lastModified: carsLastModified,
      changeFrequency: "monthly" as const,
    },
    ...makes.map(({ make }) => ({
      url: `${SITE_URL}/cars/makes/${slugify(make)}`,
      lastModified: carsLastModified,
      changeFrequency: "monthly" as const,
    })),
    {
      url: `${SITE_URL}/cars/makes/compare`,
      lastModified: carsLastModified,
      changeFrequency: "monthly" as const,
    },
    ...COMPARE_PAIRS.map((pair) => ({
      url: `${SITE_URL}/cars/makes/compare/${pairSlug(pair)}`,
      lastModified: carsLastModified,
      changeFrequency: "monthly" as const,
    })),
    {
      url: `${SITE_URL}/cars/electric-vehicles`,
      lastModified: carsLastModified,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/electric-vehicles/charging`,
      changeFrequency: "hourly" as const,
    },
    {
      url: `${SITE_URL}/cars/deregistrations`,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/parf`,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/arf`,
      changeFrequency: "yearly" as const,
    },
    {
      url: `${SITE_URL}/coe`,
      lastModified: coeLastModified,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/coe/premiums`,
      lastModified: coeLastModified,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/coe/results`,
      lastModified: coeLastModified,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/coe/pqp`,
      lastModified: coeLastModified,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/annual`,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/learn`,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "yearly" as const,
    },
    ...GUIDES.map(({ lastUpdated, slug }) => ({
      url: `${SITE_URL}/learn/${slug}`,
      lastModified: lastUpdated,
      changeFrequency: "monthly" as const,
    })),
    ...fuelTypes.map(({ fuelType }) => ({
      url: `${SITE_URL}/cars/fuel-types/${slugify(fuelType)}`,
      lastModified: carsLastModified,
      changeFrequency: "monthly" as const,
    })),
    ...vehicleTypes.map(({ vehicleType }) => ({
      url: `${SITE_URL}/cars/vehicle-types/${slugify(vehicleType)}`,
      lastModified: carsLastModified,
      changeFrequency: "monthly" as const,
    })),
    {
      url: `${SITE_URL}/legal/privacy-policy`,
      changeFrequency: "yearly" as const,
    },
    {
      url: `${SITE_URL}/legal/terms-of-service`,
      changeFrequency: "yearly" as const,
    },
  ];
}
