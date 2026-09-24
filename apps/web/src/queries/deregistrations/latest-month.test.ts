import { getDeregistrationsLatestMonth } from "@web/queries/deregistrations/latest-month";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("getDeregistrationsLatestMonth", () => {
  beforeEach(() => {
    resetDbMocks();
  });

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
