import path from "node:path";
import { AWS_LAMBDA_TEMP_DIR } from "@web/config/workflow";
import AdmZip from "adm-zip";

export const downloadFile = async (url: string, csvFile?: string) => {
  try {
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

    const arrayBuffer = await response.arrayBuffer();
    const zip = new AdmZip(Buffer.from(arrayBuffer));
    const fileNames: string[] = [];

    for (const entry of zip.getEntries()) {
      if (!entry.isDirectory) {
        console.log("Found file in ZIP:", entry.entryName);
        fileNames.push(entry.entryName);

        // Extract to file system with full path
        zip.extractEntryTo(entry, AWS_LAMBDA_TEMP_DIR, true, true);
      }
    }

    return (
      (csvFile && fileNames.find((fileName) => fileName.includes(csvFile))) ||
      fileNames[0]
    );
  } catch (error) {
    console.error("Error downloading or extracting file:", error);
    throw error;
  }
};

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

  const arrayBuffer = await response.arrayBuffer();
  const zip = new AdmZip(Buffer.from(arrayBuffer));
  const extracted = new Map<string, string>();

  for (const entry of zip.getEntries()) {
    if (!entry.isDirectory) {
      console.log("Found file in ZIP:", entry.entryName);
      zip.extractEntryTo(entry, AWS_LAMBDA_TEMP_DIR, true, true);
      extracted.set(
        path.basename(entry.entryName),
        path.join(AWS_LAMBDA_TEMP_DIR, entry.entryName),
      );
    }
  }

  return extracted;
}
