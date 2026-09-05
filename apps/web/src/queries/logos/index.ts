import {
  type CarLogo,
  manifestToLogos,
  readManifest,
} from "@motormetrics/logos";
import { LOGOS_CACHE_TAG } from "@web/lib/cache-tags";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Every logo with an image, read from the Blob manifest.
 *
 * Cached until the logos workflow revalidates the tag, so Blob is touched
 * once per manifest change rather than once per render.
 */
export async function getAllCarLogos(): Promise<
  { logos: CarLogo[] } | { error: string }
> {
  "use cache";
  cacheLife("max");
  cacheTag(LOGOS_CACHE_TAG);

  try {
    const manifest = await readManifest();
    return { logos: manifest ? manifestToLogos(manifest) : [] };
  } catch (error) {
    console.error("Error fetching logos:", error);

    return {
      error: error instanceof Error ? error.message : "Failed to fetch logos",
    };
  }
}
