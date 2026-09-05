import { put } from "@vercel/blob";
import { getFileExtension } from "../utils/file-utils";
import { normaliseMake } from "../utils/normalise-make";

const LOGO_PREFIX = "logos/";

/**
 * Upload a logo image. One operation. Overwrites any existing image for the
 * make so a refresh does not need a delete first.
 */
export const uploadLogo = async (
  make: string,
  buffer: ArrayBuffer,
  contentType: string,
): Promise<{ url: string; pathname: string; filename: string }> => {
  const normalisedMake = normaliseMake(make);
  const extension = getFileExtension(contentType);
  const filename = `${normalisedMake}.${extension}`;
  const pathname = `${LOGO_PREFIX}${filename}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType,
    allowOverwrite: true,
    cacheControlMaxAge: 31536000, // 1 year
  });

  return { url: blob.url, pathname: blob.pathname, filename };
};
