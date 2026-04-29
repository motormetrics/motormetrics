import { beforeEach, describe, expect, it, vi } from "vitest";
import { Checksum } from "./checksum";

const mockHset = vi.fn();
const mockHget = vi.fn();

const mockRedis = {
  hset: mockHset,
  hget: mockHget,
};

vi.mock("@motormetrics/utils", () => ({
  redis: {},
  slugify: (str: string) => str.toLowerCase().replace(/\s+/g, "-"),
}));

vi.mock("node:path", () => ({
  default: {
    parse: (fileName: string) => {
      const lastDot = fileName.lastIndexOf(".");
      return lastDot === -1
        ? { name: fileName }
        : { name: fileName.slice(0, lastDot) };
    },
  },
}));

describe("Checksum", () => {
  let checksum: Checksum;

  beforeEach(() => {
    vi.clearAllMocks();
    checksum = new Checksum(mockRedis as never);
  });

  describe("cacheChecksum", () => {
    it("should cache checksum value successfully", async () => {
      mockHset.mockResolvedValueOnce(1);

      const result = await checksum.cacheChecksum("test-file.csv", "abc123");

      expect(mockHset).toHaveBeenCalledWith("checksum", {
        "test-file": "abc123",
      });
      expect(result).toBe(1);
    });

    it("should slugify file name before caching", async () => {
      mockHset.mockResolvedValueOnce(1);

      await checksum.cacheChecksum("Test File Name.csv", "def456");

      expect(mockHset).toHaveBeenCalledWith("checksum", {
        "test-file-name": "def456",
      });
    });

    it("should return null and log error when caching fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockHset.mockRejectedValueOnce(new Error("Redis connection failed"));

      const result = await checksum.cacheChecksum("test.csv", "checksum123");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error caching checksum: Error: Redis connection failed",
      );
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe("getCachedChecksum", () => {
    it("should retrieve cached checksum successfully", async () => {
      mockHget.mockResolvedValueOnce("cached-checksum-value");

      const result = await checksum.getCachedChecksum("test-file.csv");

      expect(mockHget).toHaveBeenCalledWith("checksum", "test-file");
      expect(result).toBe("cached-checksum-value");
    });

    it("should return null when no cached checksum exists", async () => {
      mockHget.mockResolvedValueOnce(null);

      const result = await checksum.getCachedChecksum("non-existent.csv");

      expect(result).toBeNull();
    });

    it("should return null and log error when retrieval fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockHget.mockRejectedValueOnce(new Error("Redis connection failed"));

      const result = await checksum.getCachedChecksum("test.csv");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error retrieving cached checksum: Error: Redis connection failed",
      );
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });
});
