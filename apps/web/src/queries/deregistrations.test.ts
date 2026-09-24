import {
  getDeregistrations,
  getDeregistrationsLatestMonth,
  getDeregistrationsMonths,
} from "@web/queries/deregistrations";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  queueSelectDistinct,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("deregistrations queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  describe("getDeregistrationsLatestMonth", () => {
    it("should return the latest month", async () => {
      queueSelect([{ month: "2024-01" }]);

      const result = await getDeregistrationsLatestMonth();

      expect(result).toEqual({ month: "2024-01" });
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("deregistrations:months");
    });

    it("should return null month when no data exists", async () => {
      queueSelect([{ month: null }]);

      const result = await getDeregistrationsLatestMonth();

      expect(result).toEqual({ month: null });
    });
  });

  describe("getDeregistrationsMonths", () => {
    it("should return available months in descending order", async () => {
      queueSelectDistinct([
        { month: "2024-01" },
        { month: "2023-12" },
        { month: "2023-11" },
      ]);

      const result = await getDeregistrationsMonths();

      expect(result).toEqual([
        { month: "2024-01" },
        { month: "2023-12" },
        { month: "2023-11" },
      ]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("deregistrations:months");
    });

    it("should return empty array when no data exists", async () => {
      queueSelectDistinct([]);

      const result = await getDeregistrationsMonths();

      expect(result).toEqual([]);
    });
  });

  describe("getDeregistrations", () => {
    it("should return all deregistrations ordered by month ascending", async () => {
      queueSelect([
        { month: "2023-11", category: "Category A", number: 100 },
        { month: "2023-12", category: "Category A", number: 150 },
        { month: "2024-01", category: "Category A", number: 200 },
      ]);

      const result = await getDeregistrations();

      expect(result).toEqual([
        { month: "2023-11", category: "Category A", number: 100 },
        { month: "2023-12", category: "Category A", number: 150 },
        { month: "2024-01", category: "Category A", number: 200 },
      ]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("deregistrations:months");
    });

    it("should return empty array when no data exists", async () => {
      queueSelect([]);

      const result = await getDeregistrations();

      expect(result).toEqual([]);
    });
  });
});
