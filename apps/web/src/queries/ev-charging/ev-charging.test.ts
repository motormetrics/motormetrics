import { getEvChargingNetworkSummary } from "@web/queries/ev-charging/network-summary";
import { getEvChargingRegistrationsByMonth } from "@web/queries/ev-charging/registrations-by-month";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("ev charging queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  describe("getEvChargingNetworkSummary", () => {
    it("should return connector and site counts", async () => {
      queueSelect([{ value: 11353 }], [{ value: 2816 }]);

      const result = await getEvChargingNetworkSummary();

      expect(result).toEqual({ connectors: 11353, sites: 2816 });
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("ev-charging");
    });

    it("should return zeros when the table is empty", async () => {
      queueSelect([], []);

      const result = await getEvChargingNetworkSummary();

      expect(result).toEqual({ connectors: 0, sites: 0 });
    });
  });

  describe("getEvChargingRegistrationsByMonth", () => {
    it("should roll daily registration counts up to months, oldest first", async () => {
      queueSelect([
        { date: "2024-02-14", count: 500 },
        { date: "2024-02-20", count: 400 },
        { date: "2024-03-01", count: 1200 },
      ]);

      const result = await getEvChargingRegistrationsByMonth();

      expect(result).toEqual([
        { month: "2024-02", count: 900 },
        { month: "2024-03", count: 1200 },
      ]);
      expect(cacheTagMock).toHaveBeenCalledWith("ev-charging");
    });
  });
});
