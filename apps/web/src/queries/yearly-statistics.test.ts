import { describe, expect, it } from "vitest";
import {
  getTopMakesByYear,
  getYearlyRegistrations,
} from "./cars/yearly-statistics";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "./test-utils";

describe("yearly statistics queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("aggregates yearly registration totals", async () => {
    // The query groups by month; the fold into years happens here
    queueSelect([
      { month: "2022-01", total: 100 },
      { month: "2022-07", total: 23 },
      { month: "2023-02", total: 40 },
    ]);

    const result = await getYearlyRegistrations();

    expect(result).toEqual([
      { year: 2022, total: 123 },
      { year: 2023, total: 40 },
    ]);
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith("cars:annual");
  });

  it("returns top makes for an explicit year", async () => {
    // An explicit year skips the latest-year lookup, so there is one query
    queueSelect([{ make: "Tesla", value: 50 }]);

    const result = await getTopMakesByYear(2024, 1);

    expect(result).toEqual([{ make: "Tesla", value: 50 }]);
    expect(cacheTagMock).toHaveBeenCalledWith("cars:year:2024");
  });

  it("derives latest year when no year is supplied", async () => {
    // 1. latest month carrying registrations, 2. the makes for that year
    queueSelect([{ month: "2021-11" }], [{ make: "Toyota", value: 80 }]);

    const result = await getTopMakesByYear();

    expect(result).toEqual([{ make: "Toyota", value: 80 }]);
  });

  it("returns an empty list when no data is present", async () => {
    // The latest-month lookup comes back empty, so no second query runs
    queueSelect([]);

    const result = await getTopMakesByYear();

    expect(result).toEqual([]);
  });
});
