import { slugify } from "@motormetrics/utils/slugify";
import { getAllGuideSlugs } from "@web/app/(main)/(site)/learn/lib/guides";
import { SITE_URL } from "@web/config";
import {
  getDistinctFuelTypes,
  getDistinctMakes,
  getDistinctVehicleTypes,
} from "@web/queries/cars";
import { getAllPosts } from "@web/queries/posts";
import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("max");
  cacheTag("sitemap", "posts:list", "cars:makes");

  const [posts, makes, fuelTypes, vehicleTypes] = await Promise.all([
    getAllPosts(),
    getDistinctMakes(),
    getDistinctFuelTypes(),
    getDistinctVehicleTypes(),
  ]);

  return [
    {
      url: SITE_URL,
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
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/registrations`,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/fuel-types`,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/vehicle-types`,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/makes`,
      changeFrequency: "monthly" as const,
    },
    ...makes.map(({ make }) => ({
      url: `${SITE_URL}/cars/makes/${slugify(make)}`,
      changeFrequency: "monthly" as const,
    })),
    {
      url: `${SITE_URL}/cars/electric-vehicles`,
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
      url: `${SITE_URL}/coe`,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/coe/premiums`,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/coe/results`,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/coe/pqp`,
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
    ...getAllGuideSlugs().map((slug) => ({
      url: `${SITE_URL}/learn/${slug}`,
      changeFrequency: "monthly" as const,
    })),
    ...fuelTypes.map(({ fuelType }) => ({
      url: `${SITE_URL}/cars/fuel-types/${slugify(fuelType)}`,
      changeFrequency: "monthly" as const,
    })),
    ...vehicleTypes.map(({ vehicleType }) => ({
      url: `${SITE_URL}/cars/vehicle-types/${slugify(vehicleType)}`,
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
