import { getCoeMonths } from "@web/queries/coe/available-months";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelectDistinct,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("getCoeMonths", () => {
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
});
