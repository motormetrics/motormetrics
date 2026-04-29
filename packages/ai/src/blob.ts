import { put } from "@vercel/blob";

const BLOB_PREFIX = "posts/hero/";
const ONE_YEAR_SECONDS = 31536000;

export async function uploadPostHeroImage(
  slug: string,
  body: Buffer,
  contentType = "image/png",
): Promise<{ url: string; pathname: string }> {
  const extension = contentType.split("/")[1] ?? "png";
  const pathname = `${BLOB_PREFIX}${slug}.${extension}`;

  const blob = await put(pathname, body, {
    access: "public",
    contentType,
    cacheControlMaxAge: ONE_YEAR_SECONDS,
    allowOverwrite: true,
  });

  return { url: blob.url, pathname: blob.pathname };
}
