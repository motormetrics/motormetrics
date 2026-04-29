import path from "node:path";
import { db, getTableName, type Table } from "@motormetrics/database";
import { AWS_LAMBDA_TEMP_DIR } from "@web/config/workflow";
import { calculateChecksum } from "@web/lib/updater/services/calculate-checksum";
import { downloadFile } from "@web/lib/updater/services/download-file";
import {
  type CSVTransformOptions,
  processCsv,
} from "@web/lib/updater/services/process-csv";
import { Checksum } from "@web/utils/checksum";

export interface UpdaterConfig<T> {
  table: Table;
  url: string;
  csvFile?: string;
  filePath?: string;
  csvTransformOptions?: CSVTransformOptions<T>;
}

export interface UpdaterResult {
  table: string;
  recordsProcessed: number;
  message: string;
  timestamp: string;
  checksum?: string;
}

export interface UpdaterOptions {
  batchSize?: number;
  checksum?: Checksum;
}

const DEFAULT_BATCH_SIZE = 5000;

export async function update<T>(
  config: UpdaterConfig<T>,
  options: UpdaterOptions = {},
): Promise<UpdaterResult> {
  const checksumService = options.checksum || new Checksum();
  const batchSize = options.batchSize || DEFAULT_BATCH_SIZE;
  const tableName = getTableName(config.table);

  const { url, csvFile, csvTransformOptions = {} } = config;

  // === Download and verify ===
  let destinationPath: string;
  if (config.filePath) {
    destinationPath = config.filePath;
  } else {
    const extractedFileName = await downloadFile(url, csvFile);
    destinationPath = path.join(AWS_LAMBDA_TEMP_DIR, extractedFileName);
  }
  console.log("Destination path:", destinationPath);

  const checksumKey = path.basename(destinationPath);
  const checksum = await calculateChecksum(destinationPath);
  console.log("Checksum:", checksum);

  const cachedChecksum = await checksumService.getCachedChecksum(checksumKey);
  console.log("Cached checksum:", cachedChecksum);

  if (!cachedChecksum) {
    console.log("No cached checksum found. This might be the first run.");
    await checksumService.cacheChecksum(checksumKey, checksum);
  } else if (cachedChecksum === checksum) {
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

  await checksumService.cacheChecksum(checksumKey, checksum);
  console.log("Checksum has been changed.");

  // === Process CSV ===
  const processedData = await processCsv<T>(
    destinationPath,
    csvTransformOptions,
  );

  // === Insert records (idempotent via unique constraints) ===
  const { table } = config;

  let totalInserted = 0;
  const start = performance.now();

  for (let i = 0; i < processedData.length; i += batchSize) {
    const batch = processedData.slice(i, i + batchSize);
    const inserted = await db
      .insert(table)
      .values(batch)
      .onConflictDoNothing()
      .returning();
    totalInserted += inserted.length;
    console.log(
      `Inserted batch of ${inserted.length} records. Total: ${totalInserted}`,
    );
  }

  const end = performance.now();
  console.log(
    `Inserted ${totalInserted} record(s) in ${Math.round(end - start)}ms`,
  );

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
