import {
  fetchMonthsForCars,
  fetchMonthsForDeregistrations,
  getLatestMonth,
  getMonthOrLatest,
} from "@web/utils/dates/months";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCarsMonths = vi.fn();
const mockGetCarsLatestMonth = vi.fn();
const mockGetCoeMonths = vi.fn();
const mockGetCOELatestMonth = vi.fn();
const mockGetDeregistrationsMonths = vi.fn();
const mockGetDeregistrationsLatestMonth = vi.fn();

vi.mock("@web/queries/cars", () => ({
  getCarsMonths: () => mockGetCarsMonths(),
}));

vi.mock("@web/queries/cars/latest-month", () => ({
  getCarsLatestMonth: () => mockGetCarsLatestMonth(),
}));

vi.mock("@web/queries/coe", () => ({
  getCoeMonths: () => mockGetCoeMonths(),
}));

vi.mock("@web/queries/coe/latest-month", () => ({
  getCOELatestMonth: () => mockGetCOELatestMonth(),
}));

vi.mock("@web/queries/deregistrations", () => ({
  getDeregistrationsMonths: () => mockGetDeregistrationsMonths(),
  getDeregistrationsLatestMonth: () => mockGetDeregistrationsLatestMonth(),
}));

describe("months utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchMonthsForCars", () => {
    it("should return array of month strings from cars data", async () => {
      mockGetCarsMonths.mockResolvedValueOnce([
        { month: "2024-01" },
        { month: "2024-02" },
        { month: "2024-03" },
      ]);

      const result = await fetchMonthsForCars();

      expect(result).toEqual(["2024-01", "2024-02", "2024-03"]);
    });

    it("should return empty array when no cars data", async () => {
      mockGetCarsMonths.mockResolvedValueOnce([]);

      const result = await fetchMonthsForCars();

      expect(result).toEqual([]);
    });
  });

  describe("fetchMonthsForDeregistrations", () => {
    it("should return array of month strings from deregistrations data", async () => {
      mockGetDeregistrationsMonths.mockResolvedValueOnce([
        { month: "2024-01" },
        { month: "2024-02" },
      ]);

      const result = await fetchMonthsForDeregistrations();

      expect(result).toEqual(["2024-01", "2024-02"]);
    });

    it("should return empty array when no deregistrations data", async () => {
      mockGetDeregistrationsMonths.mockResolvedValueOnce([]);

      const result = await fetchMonthsForDeregistrations();

      expect(result).toEqual([]);
    });
  });

  describe("getLatestMonth", () => {
    it("should return latest month for cars type (default)", async () => {
      mockGetCarsLatestMonth.mockResolvedValueOnce("2024-03");

      const result = await getLatestMonth();

      expect(result).toBe("2024-03");
      expect(mockGetCarsLatestMonth).toHaveBeenCalledTimes(1);
    });

    it("should return latest month for cars type when explicitly specified", async () => {
      mockGetCarsLatestMonth.mockResolvedValueOnce("2024-03");

      const result = await getLatestMonth("cars");

      expect(result).toBe("2024-03");
    });

    it("should return latest month for coe type", async () => {
      mockGetCOELatestMonth.mockResolvedValueOnce("2024-02");

      const result = await getLatestMonth("coe");

      expect(result).toBe("2024-02");
      expect(mockGetCOELatestMonth).toHaveBeenCalledTimes(1);
    });

    it("should return latest month for deregistrations type", async () => {
      mockGetDeregistrationsLatestMonth.mockResolvedValueOnce({
        month: "2024-01",
      });

      const result = await getLatestMonth("deregistrations");

      expect(result).toBe("2024-01");
      expect(mockGetDeregistrationsLatestMonth).toHaveBeenCalledTimes(1);
    });

    it("should throw error when no cars data available", async () => {
      mockGetCarsLatestMonth.mockResolvedValueOnce(null);

      await expect(getLatestMonth("cars")).rejects.toThrow(
        "No cars data available",
      );
    });

    it("should throw error when no coe data available", async () => {
      mockGetCOELatestMonth.mockResolvedValueOnce(null);

      await expect(getLatestMonth("coe")).rejects.toThrow(
        "No coe data available",
      );
    });

    it("should throw error when no deregistrations data available", async () => {
      mockGetDeregistrationsLatestMonth.mockResolvedValueOnce(null);

      await expect(getLatestMonth("deregistrations")).rejects.toThrow(
        "No deregistrations data available",
      );
    });

    it("should throw error when deregistrations result has no month", async () => {
      mockGetDeregistrationsLatestMonth.mockResolvedValueOnce({ month: null });

      await expect(getLatestMonth("deregistrations")).rejects.toThrow(
        "No deregistrations data available",
      );
    });
  });

  describe("getMonthOrLatest", () => {
    it("should return provided month when it exists in available months", async () => {
      mockGetCarsLatestMonth.mockResolvedValueOnce("2024-03");
      mockGetCarsMonths.mockResolvedValueOnce([
        { month: "2024-05" },
        { month: "2024-04" },
        { month: "2024-03" },
      ]);

      const result = await getMonthOrLatest("2024-05");

      expect(result).toEqual({ month: "2024-05", wasAdjusted: false });
    });

    it("should return latest month with wasAdjusted true when month not in available list", async () => {
      mockGetCarsLatestMonth.mockResolvedValueOnce("2024-03");
      mockGetCarsMonths.mockResolvedValueOnce([
        { month: "2024-03" },
        { month: "2024-02" },
        { month: "2024-01" },
      ]);

      const result = await getMonthOrLatest("2024-05", "cars");

      expect(result).toEqual({ month: "2024-03", wasAdjusted: true });
    });

    it("should return latest cars month when month is null", async () => {
      mockGetCarsLatestMonth.mockResolvedValueOnce("2024-03");

      const result = await getMonthOrLatest(null);

      expect(result).toEqual({ month: "2024-03", wasAdjusted: false });
    });

    it("should return latest coe month when month is null and type is coe", async () => {
      mockGetCOELatestMonth.mockResolvedValueOnce("2024-02");

      const result = await getMonthOrLatest(null, "coe");

      expect(result).toEqual({ month: "2024-02", wasAdjusted: false });
    });

    it("should return latest deregistrations month when month is null and type is deregistrations", async () => {
      mockGetDeregistrationsLatestMonth.mockResolvedValueOnce({
        month: "2024-01",
      });

      const result = await getMonthOrLatest(null, "deregistrations");

      expect(result).toEqual({ month: "2024-01", wasAdjusted: false });
    });

    it("should return latest coe month with wasAdjusted when month not available in coe data", async () => {
      mockGetCOELatestMonth.mockResolvedValueOnce("2024-02");
      mockGetCoeMonths.mockResolvedValueOnce([
        { month: "2024-02" },
        { month: "2024-01" },
      ]);

      const result = await getMonthOrLatest("2024-03", "coe");

      expect(result).toEqual({ month: "2024-02", wasAdjusted: true });
    });
  });
});
