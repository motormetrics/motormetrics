import { getDeregistrationsMonths } from "@web/queries/deregistrations/available-months";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelectDistinct,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("getDeregistrationsMonths", () => {
  beforeEach(() => {
    resetDbMocks();
  });

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
