import { slugify } from "@motormetrics/utils";
import { getAllGuideSlugs } from "@web/app/(main)/(site)/learn/lib/guides";
import { SITE_LINKS, SITE_URL } from "@web/config";
import { getDistinctMakes } from "@web/queries/cars";
import { getAllPosts } from "@web/queries/posts";
import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("max");
  cacheTag("sitemap", "posts:list", "cars:makes");

  const [posts, makes] = await Promise.all([getAllPosts(), getDistinctMakes()]);

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
    })),
    {
      url: `${SITE_URL}/cars`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/registrations`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/fuel-types`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/vehicle-types`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/makes`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    ...makes.map(({ make }) => ({
      url: `${SITE_URL}/cars/makes/${slugify(make)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    })),
    {
      url: `${SITE_URL}/cars/electric-vehicles`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/deregistrations`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/parf`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/coe`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/coe/premiums`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/coe/results`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/coe/pqp`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/cars/annual`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE_URL}/learn`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    ...getAllGuideSlugs().map((slug) => ({
      url: `${SITE_URL}/learn/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    })),
    ...SITE_LINKS.map((link) => ({
      url: `${SITE_URL}${link.href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    })),
    {
      url: `${SITE_URL}/legal/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
    },
    {
      url: `${SITE_URL}/legal/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
    },
  ];
}
