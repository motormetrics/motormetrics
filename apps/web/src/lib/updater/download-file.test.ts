import { fetchAndExtractZip } from "@web/lib/updater/services/download-file";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@web/config/workflow", () => ({
  WORKFLOW_TEMP_DIR: "/tmp",
}));

// Mock fetch
global.fetch = vi.fn();

// Mock AdmZip
vi.mock("adm-zip", () => {
  const mockEntries = [
    {
      isDirectory: false,
      entryName: "test.csv",
    },
    {
      isDirectory: false,
      entryName: "data.csv",
    },
    {
      isDirectory: true,
      entryName: "folder/",
    },
  ];

  return {
    default: class MockAdmZip {
      getEntries() {
        return mockEntries;
      }

      extractEntryTo() {
        return true;
      }
    },
  };
});

describe("fetchAndExtractZip", () => {
  const mockUrl = "https://example.com/test.zip";

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    } as unknown as Response);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return a Map of extracted filenames to paths", async () => {
    const result = await fetchAndExtractZip(mockUrl);

    expect(global.fetch).toHaveBeenCalledWith(mockUrl);
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(2);
    expect(result.get("test.csv")).toBe("/tmp/test.csv");
    expect(result.get("data.csv")).toBe("/tmp/data.csv");
  });

  it("should skip directories", async () => {
    const result = await fetchAndExtractZip(mockUrl);

    expect(result.has("folder/")).toBe(false);
  });

  it("should handle HTTP errors", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: vi.fn().mockResolvedValue("Server error"),
    } as unknown as Response);

    await expect(fetchAndExtractZip(mockUrl)).rejects.toThrow(
      "HTTP error! status: 500",
    );

    consoleErrorSpy.mockRestore();
  });

  it("should handle fetch failures", async () => {
    const mockError = new Error("Network error");
    vi.mocked(global.fetch).mockRejectedValue(mockError);

    await expect(fetchAndExtractZip(mockUrl)).rejects.toThrow(mockError);
  });
});
