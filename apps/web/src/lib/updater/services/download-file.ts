import path from "node:path";
import { WORKFLOW_TEMP_DIR } from "@web/config/workflow";
import AdmZip from "adm-zip";

/**
 * Downloads a ZIP archive and extracts every file into the workflow temp
 * directory.
 *
 * @returns Map of file basename to its extracted absolute path
 */
export async function fetchAndExtractZip(
  url: string,
): Promise<Map<string, string>> {
  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Download failed:", {
      status: response.status,
      statusText: response.statusText,
      url,
      errorBody: errorBody.substring(0, 500),
      timestamp: new Date().toISOString(),
    });
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // The whole archive is buffered in memory. LTA DataMall archives are a few
  // megabytes at most, so streaming extraction is not worth the complexity.
  const arrayBuffer = await response.arrayBuffer();
  const zip = new AdmZip(Buffer.from(arrayBuffer));
  const extracted = new Map<string, string>();

  for (const entry of zip.getEntries()) {
    if (!entry.isDirectory) {
      console.log("Found file in ZIP:", entry.entryName);
      zip.extractEntryTo(entry, WORKFLOW_TEMP_DIR, true, true);
      extracted.set(
        path.basename(entry.entryName),
        path.join(WORKFLOW_TEMP_DIR, entry.entryName),
      );
    }
  }

  return extracted;
}
