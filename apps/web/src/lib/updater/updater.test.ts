import { db, type PgTable } from "@motormetrics/database";
import {
  type UpdaterConfig,
  type UpdaterOptions,
  update,
} from "@web/lib/updater";
import { calculateChecksum } from "@web/lib/updater/services/calculate-checksum";
import { fetchAndExtractZip } from "@web/lib/updater/services/download-file";
import { processCsv } from "@web/lib/updater/services/process-csv";
import type { Checksum } from "@web/utils/checksum";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock all dependencies
vi.mock("@web/lib/updater/services/download-file");
vi.mock("@web/lib/updater/services/calculate-checksum");
vi.mock("@web/lib/updater/services/process-csv");
vi.mock("@web/utils/checksum");
vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => vi.fn()),
}));
vi.mock("@motormetrics/database", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@motormetrics/database")>();
  return {
    ...actual,
    getTableName: vi.fn(() => "test_table"),
    getTableColumns: vi.fn(() => ({ month: {}, make: {}, fuel_type: {} })),
    db: {
      insert: vi.fn(),
      $cache: {
        invalidate: vi.fn(),
      },
    },
  };
});

// Mock table object
const mockTable = {
  month: "month",
  make: "make",
  fuel_type: "fuel_type",
} as unknown as PgTable;

type TestRecord = {
  month: string;
  make: string;
  fuel_type: string;
};

const createInsertMock = (rowCount = 2) => ({
  values: vi.fn().mockReturnThis(),
  onConflictDoNothing: vi.fn().mockResolvedValue({ rowCount }),
});

type InsertMock = ReturnType<typeof createInsertMock>;

describe("update", () => {
  let mockChecksum: Checksum;
  let updaterConfig: UpdaterConfig<TestRecord>;
  let updaterOptions: UpdaterOptions;

  const mockData = [
    { month: "2024-01", make: "TOYOTA", fuel_type: "Petrol" },
    { month: "2024-01", make: "HONDA", fuel_type: "Hybrid" },
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock Checksum
    mockChecksum = {
      getCachedChecksum: vi.fn(),
      cacheChecksum: vi.fn(),
    } as unknown as Checksum;

    // Setup basic config
    updaterConfig = {
      table: mockTable,
      url: "https://example.com/data.zip",
      csvTransformOptions: {},
    };

    updaterOptions = {
      checksum: mockChecksum,
      batchSize: 2,
    };

    // Default mock implementations
    vi.mocked(fetchAndExtractZip).mockResolvedValue(
      new Map([["test-file.csv", "/tmp/test-file.csv"]]),
    );
    vi.mocked(calculateChecksum).mockResolvedValue("abc123");
    vi.mocked(processCsv).mockResolvedValue(mockData);

    // Mock database insert with onConflictDoNothing chain
    const mockInsert = createInsertMock();
    vi.mocked(db.insert).mockReturnValue(mockInsert as never);

    vi.mocked(db.$cache.invalidate).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully process new data", async () => {
    vi.mocked(mockChecksum.getCachedChecksum).mockResolvedValue(null);
    vi.mocked(mockChecksum.cacheChecksum).mockResolvedValue(null);

    const result = await update(updaterConfig, updaterOptions);

    expect(result).toEqual({
      table: "test_table",
      recordsProcessed: 2,
      message: "2 record(s) inserted",
      timestamp: expect.any(String),
    });

    expect(fetchAndExtractZip).toHaveBeenCalledWith(
      "https://example.com/data.zip",
    );
    expect(calculateChecksum).toHaveBeenCalledWith("/tmp/test-file.csv");
    expect(mockChecksum.cacheChecksum).toHaveBeenCalledWith(
      "test-file.csv",
      "abc123",
    );
  });

  it("should return early when file hasn't changed", async () => {
    vi.mocked(mockChecksum.getCachedChecksum).mockResolvedValue("abc123");

    const result = await update(updaterConfig, updaterOptions);

    expect(result).toEqual({
      table: "test_table",
      recordsProcessed: 0,
      message: "File has not changed since last update",
      timestamp: expect.any(String),
    });

    expect(processCsv).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("should use onConflictDoNothing for idempotent inserts", async () => {
    vi.mocked(mockChecksum.getCachedChecksum).mockResolvedValue(null);

    await update(updaterConfig, updaterOptions);

    const insertMock = vi.mocked(db.insert).mock.results[0].value as InsertMock;
    expect(insertMock.values).toHaveBeenCalled();
    expect(insertMock.onConflictDoNothing).toHaveBeenCalled();
  });

  it("should return 0 when all records conflict", async () => {
    vi.mocked(mockChecksum.getCachedChecksum).mockResolvedValue("different123");

    const mockInsert = createInsertMock(0);
    vi.mocked(db.insert).mockReturnValue(mockInsert as never);

    const result = await update(updaterConfig, updaterOptions);

    expect(result).toEqual({
      table: "test_table",
      recordsProcessed: 0,
      message:
        "No new data to insert. The provided data matches the existing records.",
      timestamp: expect.any(String),
    });
  });

  it("should still cache the checksum when all records conflict", async () => {
    vi.mocked(mockChecksum.getCachedChecksum).mockResolvedValue("different123");

    const mockInsert = createInsertMock(0);
    vi.mocked(db.insert).mockReturnValue(mockInsert as never);

    await update(updaterConfig, updaterOptions);

    expect(mockChecksum.cacheChecksum).toHaveBeenCalledWith(
      "test-file.csv",
      "abc123",
    );
  });

  it("should not cache the checksum when the insert fails", async () => {
    vi.mocked(mockChecksum.getCachedChecksum).mockResolvedValue("different123");

    const mockInsert = createInsertMock();
    mockInsert.onConflictDoNothing.mockRejectedValue(
      new Error("Database request failed"),
    );
    vi.mocked(db.insert).mockReturnValue(mockInsert as never);

    await expect(update(updaterConfig, updaterOptions)).rejects.toThrow(
      "Database request failed",
    );

    expect(mockChecksum.cacheChecksum).not.toHaveBeenCalled();
  });

  it("should not cache the checksum when CSV processing fails", async () => {
    vi.mocked(mockChecksum.getCachedChecksum).mockResolvedValue(null);
    vi.mocked(processCsv).mockRejectedValue(new Error("Malformed CSV"));

    await expect(update(updaterConfig, updaterOptions)).rejects.toThrow(
      "Malformed CSV",
    );

    expect(mockChecksum.cacheChecksum).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("should process data in batches", async () => {
    const largeDataSet = Array(5)
      .fill(null)
      .map((_, i) => ({
        month: "2024-01",
        make: `MAKE_${i}`,
        fuel_type: "Petrol",
      }));

    vi.mocked(processCsv).mockResolvedValue(largeDataSet);
    vi.mocked(mockChecksum.getCachedChecksum).mockResolvedValue(null);

    const mockInsert = createInsertMock();
    mockInsert.onConflictDoNothing
      .mockResolvedValueOnce({ rowCount: 2 })
      .mockResolvedValueOnce({ rowCount: 2 })
      .mockResolvedValueOnce({ rowCount: 1 });
    vi.mocked(db.insert).mockReturnValue(mockInsert as never);

    const result = await update(updaterConfig, updaterOptions);

    expect(result.recordsProcessed).toBe(5);
    expect(db.insert).toHaveBeenCalledTimes(3);
  });

  it("should derive the batch size from the column count when not given", async () => {
    const largeDataSet = Array(20_001)
      .fill(null)
      .map((_, index) => ({
        month: "2024-01",
        make: `MAKE_${index}`,
        fuel_type: "Petrol",
      }));

    vi.mocked(processCsv).mockResolvedValue(largeDataSet);
    vi.mocked(mockChecksum.getCachedChecksum).mockResolvedValue(null);

    // 3 mocked columns -> floor(30,000 / 3) = 10,000 rows per batch
    await update(updaterConfig, { checksum: mockChecksum });

    expect(db.insert).toHaveBeenCalledTimes(3);
  });

  it("should throw when the ZIP contains no files", async () => {
    vi.mocked(fetchAndExtractZip).mockResolvedValue(new Map());

    await expect(update(updaterConfig, updaterOptions)).rejects.toThrow(
      "No files found in ZIP",
    );
  });

  it("should propagate errors from download", async () => {
    vi.mocked(fetchAndExtractZip).mockRejectedValue(
      new Error("Download failed"),
    );

    await expect(update(updaterConfig, updaterOptions)).rejects.toThrow(
      "Download failed",
    );
  });

  it("should skip download when filePath is provided", async () => {
    vi.mocked(mockChecksum.getCachedChecksum).mockResolvedValue(null);

    const configWithFilePath: UpdaterConfig<TestRecord> = {
      table: mockTable,
      filePath: "/tmp/pre-extracted.csv",
      csvTransformOptions: {},
    };

    await update(configWithFilePath, updaterOptions);

    expect(fetchAndExtractZip).not.toHaveBeenCalled();
    expect(calculateChecksum).toHaveBeenCalledWith("/tmp/pre-extracted.csv");
    expect(mockChecksum.cacheChecksum).toHaveBeenCalledWith(
      "pre-extracted.csv",
      "abc123",
    );
  });
});
