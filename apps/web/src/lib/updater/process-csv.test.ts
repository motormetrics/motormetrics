import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { processCsv } from "@web/lib/updater/services/process-csv";
import Papa from "papaparse";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface TestRecord {
  name: string;
  age: number;
  active: boolean;
}

describe("processCSV", () => {
  // Temporary path for testing
  const tmpDirectory = os.tmpdir();
  const filePath = path.join(tmpDirectory, "test.csv");

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up mock implementations for each test
    const _readFileSyncMock = vi
      .spyOn(fs, "readFileSync")
      .mockReturnValue("mock csv content");

    const _parseMock = vi.spyOn(Papa, "parse").mockReturnValue({
      data: [
        { name: " John Doe ", age: "25", active: "true" },
        { name: " Jane Smith ", age: "30", active: "false" },
      ],
      errors: [],
      meta: { fields: ["name", "age", "active"] },
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should read a CSV file and parse it", async () => {
    const readFileSyncMock = vi
      .spyOn(fs, "readFileSync")
      .mockReturnValue("mock csv content");
    const parseMock = vi.spyOn(Papa, "parse").mockReturnValue({
      data: [
        { name: " John Doe ", age: "25", active: "true" },
        { name: " Jane Smith ", age: "30", active: "false" },
      ],
      errors: [],
      meta: { fields: ["name", "age", "active"] },
    } as never);

    const result = await processCsv<TestRecord>(filePath);

    expect(readFileSyncMock).toHaveBeenCalledWith(filePath, "utf-8");
    expect(parseMock).toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });

  it("should use Papa.parse with correct options", async () => {
    const _readFileSyncMock = vi
      .spyOn(fs, "readFileSync")
      .mockReturnValue("mock csv content");
    const parseMock = vi.spyOn(Papa, "parse").mockReturnValue({
      data: [],
      errors: [],
      meta: { fields: [] },
    } as never);

    await processCsv(filePath);

    expect(parseMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: expect.any(Function),
        transform: expect.any(Function),
      }),
    );
  });

  it("should apply custom field transformations when provided", async () => {
    const _readFileSyncMock = vi
      .spyOn(fs, "readFileSync")
      .mockReturnValue("mock csv content");
    const parseMock = vi.spyOn(Papa, "parse").mockReturnValue({
      data: [{ name: " JOHN DOE ", age: 30 }],
      errors: [],
      meta: { fields: ["name", "age"] },
    } as never);

    const customFields = {
      name: (value: string) => value.toUpperCase().trim(),
      age: (value: string) => Number.parseInt(value, 10) + 5,
    };

    const result = await processCsv(filePath, { fields: customFields });

    // Check that Papa.parse was called with the expected options
    expect(parseMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        transform: expect.any(Function),
      }),
    );

    expect(result).toHaveLength(1);
  });

  it("should handle file read errors", async () => {
    const errorMsg = "File not found";
    const _readFileSyncMock = vi
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => {
        throw new Error(errorMsg);
      });

    await expect(processCsv(filePath)).rejects.toThrow(errorMsg);
  });

  it("should handle parsing errors", async () => {
    const _readFileSyncMock = vi
      .spyOn(fs, "readFileSync")
      .mockReturnValue("mock csv content");
    const _parseMock = vi.spyOn(Papa, "parse").mockImplementationOnce(() => {
      throw new Error("Parse error");
    });

    await expect(processCsv(filePath)).rejects.toThrow("Parse error");
  });

  it("should apply transformHeader to rename columns via columnMapping", async () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue("mock csv content");
    const parseMock = vi.spyOn(Papa, "parse").mockReturnValue({
      data: [],
      errors: [],
      meta: { fields: [] },
    } as never);

    await processCsv(filePath, {
      columnMapping: { old_name: "newName" },
    });

    const config = parseMock.mock.calls[0][1] as {
      transformHeader: (header: string) => string;
    };
    expect(config.transformHeader("old_name")).toBe("newName");
    expect(config.transformHeader("unmapped")).toBe("unmapped");
  });

  it("should apply transform with field handler when provided", async () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue("mock csv content");
    const parseMock = vi.spyOn(Papa, "parse").mockReturnValue({
      data: [],
      errors: [],
      meta: { fields: [] },
    } as never);

    const fields = { age: (v: string) => Number(v) * 2 };
    await processCsv(filePath, { fields });

    const config = parseMock.mock.calls[0][1] as {
      transform: (value: string, field: string) => unknown;
    };
    expect(config.transform("5", "age")).toBe(10);
  });

  it("should trim string values without a field handler", async () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue("mock csv content");
    const parseMock = vi.spyOn(Papa, "parse").mockReturnValue({
      data: [],
      errors: [],
      meta: { fields: [] },
    } as never);

    await processCsv(filePath);

    const config = parseMock.mock.calls[0][1] as {
      transform: (value: string, field: string) => unknown;
    };
    expect(config.transform("  hello  ", "name")).toBe("hello");
  });

  it("should return an empty array if no records are found", async () => {
    const _readFileSyncMock = vi
      .spyOn(fs, "readFileSync")
      .mockReturnValue("mock csv content");
    const _parseMock = vi.spyOn(Papa, "parse").mockReturnValueOnce({
      data: [],
      errors: [],
      meta: { fields: [] },
    } as never);

    const result = await processCsv(filePath);

    expect(result).toHaveLength(0);
  });
});
