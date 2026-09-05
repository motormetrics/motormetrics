import {
  bootstrapManifest,
  downloadLogo,
  type LogoEntry,
  type LogoManifest,
  normaliseMake,
  readManifest,
  writeManifest,
} from "@motormetrics/logos";
import { LOGOS_CACHE_TAG } from "@web/lib/cache-tags";
import { getDistinctMakes } from "@web/queries/cars/filter-options";
import { revalidateTag } from "next/cache";
import { fetch } from "workflow";

interface LogosWorkflowResult {
  message: string;
  fetched: number;
  missing: number;
  skipped: number;
}

/**
 * Fill gaps in the logo manifest.
 *
 * Reads the manifest once, diffs it against the makes in the cars data, and
 * fetches only the makes it has never seen. A make the source lacks is
 * recorded as `missing` and never retried; any other failure is left out of
 * the manifest so the next run tries again. Existing entries are never
 * touched, so a run with nothing new costs a single Blob read.
 */
export async function logosWorkflow(): Promise<LogosWorkflowResult> {
  "use workflow";

  globalThis.fetch = fetch;

  const manifest = await loadManifest();
  const makes = await listMakes();
  const pending = makes.filter((make) => !manifest.logos[make]);

  if (pending.length === 0) {
    return {
      message: "[LOGOS] Manifest already covers every make",
      fetched: 0,
      missing: 0,
      skipped: 0,
    };
  }

  const entries: LogoEntry[] = [];
  let skipped = 0;

  // Sequential on purpose: one request at a time to the source.
  for (const make of pending) {
    const entry = await fetchLogo(make);
    if (entry) {
      entries.push(entry);
    } else {
      skipped += 1;
    }
  }

  const fetched = entries.filter((entry) => entry.status === "found").length;
  const missing = entries.length - fetched;

  if (entries.length > 0) {
    await saveManifest(manifest, entries);
    await revalidateLogosCache();
  }

  return {
    message: `[LOGOS] ${fetched} fetched, ${missing} missing, ${skipped} skipped`,
    fetched,
    missing,
    skipped,
  };
}

/**
 * The manifest, or one built from the images already in Blob if none exists.
 * Bootstrapping writes straight away so the list is never repeated.
 */
async function loadManifest(): Promise<LogoManifest> {
  "use step";

  const existing = await readManifest();
  if (existing) {
    return existing;
  }

  console.log("[LOGOS] No manifest found, bootstrapping from existing blobs");
  return writeManifest(await bootstrapManifest());
}

async function listMakes(): Promise<string[]> {
  "use step";

  const rows = await getDistinctMakes();
  return [...new Set(rows.map((row) => normaliseMake(row.make)))].sort();
}

/**
 * One make, one step, so a retry re-fetches only this image. Returns null
 * for a failure other than a 404 so the make is retried on the next run.
 */
async function fetchLogo(make: string): Promise<LogoEntry | null> {
  "use step";

  const result = await downloadLogo(make);
  const checkedAt = new Date().toISOString();

  if (result.success) {
    console.log(`[LOGOS] Fetched ${make}`);
    return {
      make,
      status: "found",
      url: result.url,
      pathname: result.pathname,
      sourceUrl: result.sourceUrl,
      checkedAt,
      lastError: null,
    };
  }

  if (result.error.endsWith(" 404")) {
    console.log(`[LOGOS] No logo at source for ${make}`);
    return {
      make,
      status: "missing",
      url: null,
      pathname: null,
      sourceUrl: result.sourceUrl,
      checkedAt,
      lastError: result.error,
    };
  }

  console.warn(`[LOGOS] Skipping ${make} this run: ${result.error}`);
  return null;
}

async function saveManifest(
  manifest: LogoManifest,
  entries: LogoEntry[],
): Promise<void> {
  "use step";

  const logos = { ...manifest.logos };
  for (const entry of entries) {
    logos[entry.make] = entry;
  }

  await writeManifest({ ...manifest, logos });
}

async function revalidateLogosCache(): Promise<void> {
  "use step";

  revalidateTag(LOGOS_CACHE_TAG, "max");
  console.log("[LOGOS] Cache revalidated");
}
