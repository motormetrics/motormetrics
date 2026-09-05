import path from "node:path";
import {
  db,
  getTableColumns,
  getTableName,
  type PgTable,
} from "@motormetrics/database";
import { calculateChecksum } from "@web/lib/updater/services/calculate-checksum";
import { fetchAndExtractZip } from "@web/lib/updater/services/download-file";
import {
  type CSVTransformOptions,
  processCsv,
} from "@web/lib/updater/services/process-csv";
import { Checksum } from "@web/utils/checksum";

type UpdaterSource =
  | { url: string; filePath?: never }
  | { filePath: string; url?: never };

export type UpdaterConfig<T> = UpdaterSource & {
  table: PgTable;
  csvTransformOptions?: CSVTransformOptions<T>;
};

export interface UpdaterResult {
  table: string;
  recordsProcessed: number;
  message: string;
  timestamp: string;
  checksum?: string;
}

export interface UpdaterOptions {
  /** Rows per INSERT. Defaults to the largest batch that fits Neon's limit. */
  batchSize?: number;
  checksum?: Checksum;
}

// Neon's HTTP endpoint rejects statements with more than 32,767 bound
// parameters (a signed 16-bit count). Leave headroom below that.
const MAX_BOUND_PARAMETERS = 30_000;

export async function update<T>(
  config: UpdaterConfig<T>,
  options: UpdaterOptions = {},
): Promise<UpdaterResult> {
  const { table, csvTransformOptions = {} } = config;
  const checksumService = options.checksum ?? new Checksum();
  const columnCount = Object.keys(getTableColumns(table)).length;
  const batchSize =
    options.batchSize ?? Math.floor(MAX_BOUND_PARAMETERS / columnCount);
  const tableName = getTableName(table);

  // === Download and verify ===
  let destinationPath: string;
  if (config.url === undefined) {
    destinationPath = config.filePath;
  } else {
    const extractedFiles = await fetchAndExtractZip(config.url);
    const [firstFile] = extractedFiles.values();
    if (!firstFile) {
      throw new Error(`No files found in ZIP at ${config.url}`);
    }
    destinationPath = firstFile;
  }
  console.log("Destination path:", destinationPath);

  const checksumKey = path.basename(destinationPath);
  const checksum = await calculateChecksum(destinationPath);
  console.log("Checksum:", checksum);

  const cachedChecksum = await checksumService.getCachedChecksum(checksumKey);
  console.log("Cached checksum:", cachedChecksum);

  if (!cachedChecksum) {
    console.log("No cached checksum found. This might be the first run.");
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
  } else {
    console.log("Checksum has been changed.");
  }

  // === Process CSV ===
  const processedData = await processCsv<T>(
    destinationPath,
    csvTransformOptions,
  );

  // === Insert records (idempotent via unique constraints) ===
  let totalInserted = 0;
  const start = performance.now();

  for (let index = 0; index < processedData.length; index += batchSize) {
    const batch = processedData.slice(index, index + batchSize);
    const { rowCount } = await db
      .insert(table)
      .values(batch)
      .onConflictDoNothing();
    totalInserted += rowCount;
    console.log(
      `Inserted batch of ${rowCount} records. Total: ${totalInserted}`,
    );
  }

  const end = performance.now();
  console.log(
    `Inserted ${totalInserted} record(s) in ${Math.round(end - start)}ms`,
  );

  // Cache the checksum only after the insert succeeds, so a failed run is
  // retried instead of being skipped as "unchanged" next time.
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
