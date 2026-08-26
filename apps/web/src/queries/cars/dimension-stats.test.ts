import { describe, expect, it } from "vitest";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "../test-utils";
import { getDimensionStats } from "./dimension-stats";

describe("getDimensionStats", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should return share, trend and year-over-year change per dimension value", async () => {
    queueSelect(
      [
        { name: "TOYOTA", count: 600 },
        { name: "BMW", count: 400 },
      ],
      [
        { name: "TOYOTA", count: 500 },
        { name: "BMW", count: 500 },
      ],
      [
        { name: "TOYOTA", month: "2025-09", count: 250 },
        { name: "BMW", month: "2025-09", count: 150 },
        { name: "TOYOTA", month: "2025-10", count: 350 },
      ],
    );

    const result = await getDimensionStats("make", "2025-10");

    expect(result).toEqual([
      {
        name: "TOYOTA",
        count: 600,
        share: 60,
        trend: [{ value: 250 }, { value: 350 }],
        yoyChange: 20,
      },
      {
        name: "BMW",
        count: 400,
        share: 40,
        trend: [{ value: 150 }],
        yoyChange: -20,
      },
    ]);
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith(
      "cars:month:2025-10",
      "cars:annual",
    );
  });

  it("should report no year-over-year change when the value is new", async () => {
    queueSelect([{ name: "BYD", count: 120 }], [], []);

    const result = await getDimensionStats("make", "2025-10");

    expect(result).toEqual([
      { name: "BYD", count: 120, share: 100, trend: [], yoyChange: null },
    ]);
  });

  it("should return an empty list when the month has no registrations", async () => {
    queueSelect([], [], []);

    await expect(getDimensionStats("fuelType", "2025-10")).resolves.toEqual([]);
    expect(cacheTagMock).toHaveBeenCalledWith(
      "cars:month:2025-10",
      "cars:annual",
    );
  });
});
