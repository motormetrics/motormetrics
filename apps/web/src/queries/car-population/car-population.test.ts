import { getCarPopulationYears } from "@web/queries/car-population/available-years";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelectDistinct,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("car population queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  describe("getCarPopulationYears", () => {
    it("should return distinct years in descending order", async () => {
      queueSelectDistinct([{ year: "2025" }, { year: "2024" }]);

      const result = await getCarPopulationYears();

      expect(result).toEqual([{ year: "2025" }, { year: "2024" }]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("cars:population:years");
    });

    it("should return empty array when no data exists", async () => {
      queueSelectDistinct([]);

      const result = await getCarPopulationYears();

      expect(result).toEqual([]);
    });
  });
});
