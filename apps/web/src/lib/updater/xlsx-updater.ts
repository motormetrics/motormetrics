import { createHash } from "node:crypto";
import { db, getTableName, type Table } from "@motormetrics/database";
import { processCarCostXlsx } from "@web/lib/updater/services/process-xlsx";
import type { UpdaterResult } from "@web/lib/updater/updater";
import { Checksum } from "@web/utils/checksum";

export interface XlsxUpdaterConfig {
  table: Table;
  url: string;
}

export interface XlsxUpdaterOptions {
  batchSize?: number;
  checksum?: Checksum;
}

const DEFAULT_BATCH_SIZE = 5000;

/**
 * Fetches an XLSX file, computes checksum, parses with ExcelJS, and batch inserts.
 * Designed for in-memory processing (no temp file I/O) suitable for serverless.
 */
export async function updateFromXlsx<T>(
  config: XlsxUpdaterConfig,
  options: XlsxUpdaterOptions = {},
): Promise<UpdaterResult> {
  const checksumService = options.checksum || new Checksum();
  const batchSize = options.batchSize || DEFAULT_BATCH_SIZE;
  const tableName = getTableName(config.table);

  // === Fetch XLSX as binary ===
  const response = await fetch(config.url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch XLSX from ${config.url}: ${response.status} ${response.statusText}`,
    );
  }

  const buffer = await response.arrayBuffer();
  console.log(`Downloaded XLSX: ${buffer.byteLength} bytes`);

  // === Checksum on raw bytes ===
  const checksum = createHash("sha256")
    .update(new Uint8Array(buffer))
    .digest("hex");
  console.log("Checksum:", checksum);

  const checksumKey = `car-cost-update-xlsx`;
  const cachedChecksum = await checksumService.getCachedChecksum(checksumKey);
  console.log("Cached checksum:", cachedChecksum);

  if (cachedChecksum === checksum) {
    console.log(
      `File has not changed since last update (Checksum: ${checksum})`,
    );
    return {
      table: tableName,
      recordsProcessed: 0,
      message: "File has not changed since last update",
      timestamp: new Date().toISOString(),
    };
  }

  if (!cachedChecksum) {
    console.log("No cached checksum found. This might be the first run.");
  } else {
    console.log("Checksum has changed.");
  }

  // === Parse XLSX ===
  const { records } = await processCarCostXlsx<T>(buffer);

  // === Insert records (idempotent via unique constraints) ===
  const { table } = config;

  let totalInserted = 0;
  const start = performance.now();

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    try {
      const inserted = await db
        .insert(table)
        .values(batch)
        .onConflictDoNothing()
        .returning();
      totalInserted += inserted.length;
      console.log(
        `Inserted batch of ${inserted.length} records. Total: ${totalInserted}`,
      );
    } catch (error) {
      console.error(
        `Failed to insert batch starting at index ${i}:`,
        error instanceof Error ? error.message.slice(-500) : error,
      );
      console.error("First record in failed batch:", JSON.stringify(batch[0]));
      throw error;
    }
  }

  const end = performance.now();
  console.log(
    `Inserted ${totalInserted} record(s) in ${Math.round(end - start)}ms`,
  );

  // Cache checksum only after successful insert to allow retries on failure
  await checksumService.cacheChecksum(checksumKey, checksum);

  if (totalInserted === 0) {
    return {
      table: tableName,
      recordsProcessed: 0,
      message:
        "No new data to insert. The provided data matches the existing records.",
      timestamp: new Date().toISOString(),
    };
  }

  return {
    table: tableName,
    recordsProcessed: totalInserted,
    message: `${totalInserted} record(s) inserted`,
    timestamp: new Date().toISOString(),
  };
}
