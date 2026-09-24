import {
  getCoeMonths,
  getCoeResults,
  getCoeResultsByPeriod,
  getLatestCoeResults,
} from "@web/queries/coe";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  queueSelectDistinct,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("COE queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should return the available COE months", async () => {
    queueSelectDistinct([{ month: "2024-05" }, { month: "2024-04" }]);

    const result = await getCoeMonths();

    expect(result).toEqual([{ month: "2024-05" }, { month: "2024-04" }]);
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith("coe:months");
  });

  it("should return the latest COE bidding results", async () => {
    // Queue results in order of db.select() calls:
    // 1. latestMonthSubquery, 2. latestBiddingSubquery, 3. main query (the one that's awaited)
    queueSelect(
      [], // latestMonthSubquery (embedded in SQL, not awaited directly)
      [], // latestBiddingSubquery (embedded in SQL, not awaited directly)
      [{ month: "2024-05", biddingNo: 2, vehicleClass: "A" }], // main query result
    );

    const result = await getLatestCoeResults();

    expect(result).toEqual([
      {
        month: "2024-05",
        biddingNo: 2,
        vehicleClass: "A",
      },
    ]);
    expect(cacheTagMock).toHaveBeenCalledWith("coe:latest");
  });

  it("should return an empty list when no latest month is available", async () => {
    queueSelect([{ latestMonth: null }]);

    const result = await getLatestCoeResults();

    expect(result).toEqual([]);
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
