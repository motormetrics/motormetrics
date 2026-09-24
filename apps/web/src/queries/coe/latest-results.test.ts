import { getLatestCoeResults } from "@web/queries/coe/latest-results";
import {
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("getLatestCoeResults", () => {
  beforeEach(() => {
    resetDbMocks();
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
});
