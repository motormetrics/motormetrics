import {
  manifestToLogos,
  readManifest,
} from "@motormetrics/logos/services/manifest";
import type { CarLogo } from "@motormetrics/logos/types";
import { LOGOS_CACHE_TAG } from "@web/lib/cache-tags";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Cached until the logos workflow revalidates the tag, so Blob is touched
 * once per manifest change rather than once per render.
 *
 * Throws on a Blob failure so the shared remote cache never stores the
 * error; the next request retries instead of serving the failure for the
 * life of the entry.
 */
async function readCarLogos(): Promise<CarLogo[]> {
  "use cache";
  cacheLife("max");
  cacheTag(LOGOS_CACHE_TAG);

  const manifest = await readManifest();
  return manifest ? manifestToLogos(manifest) : [];
}

/** Every logo with an image, read from the Blob manifest. */
export async function getAllCarLogos(): Promise<
  { logos: CarLogo[] } | { error: string }
> {
  try {
    return { logos: await readCarLogos() };
  } catch (error) {
    console.error("Error fetching logos:", error);

    return {
      error: error instanceof Error ? error.message : "Failed to fetch logos",
    };
  }
}
