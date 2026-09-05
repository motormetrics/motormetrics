import { del, list, put } from "@vercel/blob";
import type { CarLogo } from "../types";
import { getFileExtension } from "../utils/file-utils";
import { normaliseMake } from "../utils/normalise-make";

const BLOB_PREFIX = "logos/";

/**
 * Upload a logo to Vercel Blob storage
 */
export const uploadLogo = async (
  make: string,
  buffer: ArrayBuffer,
  contentType: string,
): Promise<{ url: string; filename: string } | null> => {
  const normalisedMake = normaliseMake(make);
  const extension = getFileExtension(contentType);
  const filename = `${normalisedMake}.${extension}`;
  const pathname = `${BLOB_PREFIX}${filename}`;

  try {
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
      cacheControlMaxAge: 31536000, // 1 year
    });

    return { url: blob.url, filename };
  } catch (error) {
    console.error("[uploadLogo] Error uploading to Vercel Blob:", error);
    return null;
  }
};

export const listLogos = async (): Promise<CarLogo[]> => {
  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX });

    return blobs.map((blob) => {
      const filename = blob.pathname.replace(BLOB_PREFIX, "");
      const make = filename.replace(/\.[^/.]+$/, "");

      return {
        make,
        filename,
        url: blob.url,
      };
    });
  } catch (error) {
    console.error("[listLogos] Error listing from Vercel Blob:", error);
    return [];
  }
};

export const getLogo = async (make: string): Promise<CarLogo | null> => {
  const normalisedMake = normaliseMake(make);

  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX });

    const blob = blobs.find((b) => {
      const filename = b.pathname.replace(BLOB_PREFIX, "");
      const blobMake = filename.replace(/\.[^/.]+$/, "");
      return blobMake === normalisedMake;
    });

    if (!blob) {
      return null;
    }

    const filename = blob.pathname.replace(BLOB_PREFIX, "");
    return {
      make: normalisedMake,
      filename,
      url: blob.url,
    };
  } catch (error) {
    console.error(
      `[getLogo] Error fetching logo for ${normalisedMake}:`,
      error,
    );
    return null;
  }
};

export const deleteLogo = async (make: string): Promise<boolean> => {
  const normalisedMake = normaliseMake(make);

  try {
    const logo = await getLogo(normalisedMake);
    if (!logo) {
      return true;
    }

    await del(logo.url);

    return true;
  } catch (error) {
    console.error("[deleteLogo] Error deleting logo:", error);
    return false;
  }
};
