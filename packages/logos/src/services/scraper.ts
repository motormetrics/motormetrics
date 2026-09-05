import { BASE_URL } from "../config";
import type { CarLogo } from "../types";
import { extractFileExtension, getContentType } from "../utils/file-utils";
import { normaliseMake } from "../utils/normalise-make";
import * as blobStorage from "./blob";

export interface ScrapeResult {
  success: boolean;
  logo?: CarLogo;
  error?: string;
}

/**
 * Download a logo from external source and store in Vercel Blob
 * Returns the existing logo if one is already stored
 */
export const downloadLogo = async (make: string): Promise<ScrapeResult> => {
  try {
    const normalisedMake = normaliseMake(make);

    // Check if already exists
    const existing = await blobStorage.getLogo(make);

    if (existing) {
      return {
        success: true,
        logo: existing,
      };
    }

    // Download logo using direct URL pattern
    const logoUrl = `${BASE_URL}/${normalisedMake}-logo.png`;

    const response = await fetch(logoUrl);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch logo: ${response.status}`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength < 100) {
      return {
        success: false,
        error: "Downloaded image is too small, likely corrupted",
      };
    }

    // Determine content type
    const extension = extractFileExtension(logoUrl);
    const contentType = getContentType(`${normalisedMake}.${extension}`);

    // Upload to Vercel Blob
    const result = await blobStorage.uploadLogo(make, arrayBuffer, contentType);

    if (!result) {
      return {
        success: false,
        error: "Failed to upload logo to storage",
      };
    }

    return {
      success: true,
      logo: {
        make: normalisedMake,
        filename: result.filename,
        url: result.url,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      error: errorMessage,
    };
  }
};
