import { get, list, put } from "@vercel/blob";
import type { CarLogo, LogoEntry, LogoManifest } from "../types";

export const MANIFEST_PATHNAME = "logos/manifest.json";
const LOGO_PREFIX = "logos/";

const createEmptyManifest = (): LogoManifest => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  logos: {},
});

/**
 * Read the manifest from Blob. One operation. Returns null when no manifest
 * has been written yet so the caller can bootstrap one.
 */
export const readManifest = async (): Promise<LogoManifest | null> => {
  const result = await get(MANIFEST_PATHNAME, {
    access: "public",
    useCache: false,
  });

  if (!result || result.statusCode !== 200) {
    return null;
  }

  const text = await new Response(result.stream).text();
  return JSON.parse(text) as LogoManifest;
};

/**
 * Overwrite the manifest. One operation. The workflow is the only writer.
 */
export const writeManifest = async (
  manifest: LogoManifest,
): Promise<LogoManifest> => {
  const next: LogoManifest = {
    ...manifest,
    updatedAt: new Date().toISOString(),
  };

  await put(MANIFEST_PATHNAME, JSON.stringify(next, null, 2), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });

  return next;
};

/**
 * Build a manifest from whatever images already exist under the prefix.
 * Pages through `list`, so it costs one operation per 1000 blobs. Meant to
 * run once, the first time no manifest is found.
 */
export const bootstrapManifest = async (): Promise<LogoManifest> => {
  const manifest = createEmptyManifest();
  let cursor: string | undefined;

  do {
    const page = await list({ prefix: LOGO_PREFIX, cursor, limit: 1000 });

    for (const blob of page.blobs) {
      if (blob.pathname === MANIFEST_PATHNAME) continue;

      const filename = blob.pathname.replace(LOGO_PREFIX, "");
      const make = filename.replace(/\.[^/.]+$/, "");

      manifest.logos[make] = {
        make,
        status: "found",
        url: blob.url,
        pathname: blob.pathname,
        sourceUrl: null,
        checkedAt: manifest.updatedAt,
        lastError: null,
      };
    }

    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return manifest;
};

/**
 * The entries that have an image, in the shape pages consume.
 */
export const manifestToLogos = (manifest: LogoManifest): CarLogo[] =>
  Object.values(manifest.logos)
    .filter(
      (entry): entry is LogoEntry & { url: string; pathname: string } =>
        entry.status !== "missing" &&
        entry.url !== null &&
        entry.pathname !== null,
    )
    .map((entry) => ({
      make: entry.make,
      url: entry.url,
      filename: entry.pathname.replace(LOGO_PREFIX, ""),
    }))
    .sort((left, right) => left.make.localeCompare(right.make));
