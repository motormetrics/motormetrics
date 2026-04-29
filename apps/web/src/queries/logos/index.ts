import { getLogo, listLogos } from "@logos/services/blob";
import { downloadLogo } from "@logos/services/scraper";
import type { CarLogo } from "@logos/types";
import { normaliseMake } from "@logos/utils/normalise-make";
import { redis } from "@motormetrics/utils";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Get a single car logo by make
 * Implements cache-aside pattern with automatic download fallback
 *
 * @param make - The car make (will be normalized automatically)
 * @returns Logo object with actual values or empty strings if not found/download fails
 */
export async function getCarLogo(make: string): Promise<CarLogo | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(`logos:make:${make}`);

  try {
    const normalisedMake = normaliseMake(make);
    const cacheKey = `logo:${normalisedMake}`;

    // Check cache first
    const cachedLogo = await redis.get<CarLogo>(cacheKey);
    if (cachedLogo) {
      console.log(`Cache hit for ${normalisedMake}`);
      return cachedLogo;
    }

    // Cache miss - try to get from blob storage or download
    console.log(`Cache miss for ${normalisedMake}`);
    let logo = await getLogo(normalisedMake);

    // Auto-download if not found in blob storage
    if (!logo) {
      const downloadResult = await downloadLogo(normalisedMake);

      if (downloadResult.success && downloadResult.logo) {
        logo = downloadResult.logo;
      } else {
        // Cache negative result to avoid repeated download attempts
        logo = {
          make: normalisedMake,
          filename: "",
          url: "",
        };
      }
    }

    // Cache the result (success or failure)
    await redis.set(cacheKey, JSON.stringify(logo));

    return logo;
  } catch (error) {
    console.error("Error fetching logo:", error);
    return;
  }
}

/**
 * Get all available car logos with caching
 *
 * @returns Array of all logos or error
 */
export async function getAllCarLogos(): Promise<
  { logos: CarLogo[] } | { error: string }
> {
  try {
    // Check cache first
    const cachedLogos = await redis.get<CarLogo[]>("logos:all");
    if (cachedLogos) {
      console.log("Using cached logos list");
      return { logos: cachedLogos };
    }

    // Cache miss - fetch from blob storage
    console.log("Cache miss, fetching from blob storage");
    const logos = await listLogos();

    // Cache the result
    await redis.set("logos:all", JSON.stringify(logos));
    console.log("Cached logos list");

    return { logos };
  } catch (error) {
    console.error("Error fetching logos:", error);

    return {
      error: error instanceof Error ? error.message : "Failed to fetch logos",
    };
  }
}
