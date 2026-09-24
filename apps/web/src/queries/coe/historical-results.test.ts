import {
  getCoeResults,
  getCoeResultsByPeriod,
} from "@web/queries/coe/historical-results";
import {
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("COE historical result queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should load all COE results without filters", async () => {
    queueSelect([{ id: 1 }]);

    const result = await getCoeResults();

    expect(result).toEqual([{ id: 1 }]);
    expect(cacheTagMock).toHaveBeenCalledWith("coe:results");
  });

  it("should return COE results by period with correct cache tag", async () => {
    // Batch call: max(month) and min(month)
    queueSelect([{ month: "2024-05" }], [{ month: "2024-01" }]);
    // Final select for filtered results
    queueSelect([{ id: 2 }]);

    const result = await getCoeResultsByPeriod("12m");

    expect(result).toEqual([{ id: 2 }]);
    expect(cacheTagMock).toHaveBeenCalledWith("coe:period:12m");
  });

  it("should return empty array when no months available", async () => {
    // Batch call: max(month) and min(month) return null
    queueSelect([{ month: null }], [{ month: null }]);

    const result = await getCoeResultsByPeriod("12m");

    expect(result).toEqual([]);
  });

  it("should use default period of 12m when not specified", async () => {
    // Batch call: max(month) and min(month)
    queueSelect([{ month: "2024-05" }], [{ month: "2024-01" }]);
    // Final select for filtered results
    queueSelect([{ id: 3 }]);

    await getCoeResultsByPeriod();

    expect(cacheTagMock).toHaveBeenCalledWith("coe:period:12m");
  });
});
