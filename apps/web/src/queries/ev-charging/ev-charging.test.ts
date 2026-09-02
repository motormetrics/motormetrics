import { describe, expect, it } from "vitest";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "../test-utils";
import { getEvChargingNetworkSummary } from "./network-summary";
import { getEvChargingRegistrationsByMonth } from "./registrations-by-month";

describe("ev charging queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  describe("getEvChargingNetworkSummary", () => {
    it("should return connector and site counts", async () => {
      queueSelect([{ connectors: 11353, sites: 2816 }]);

      const result = await getEvChargingNetworkSummary();

      expect(result).toEqual({ connectors: 11353, sites: 2816 });
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("ev-charging");
    });

    it("should return zeros when the table is empty", async () => {
      queueSelect([]);

      const result = await getEvChargingNetworkSummary();

      expect(result).toEqual({ connectors: 0, sites: 0 });
    });
  });

  describe("getEvChargingRegistrationsByMonth", () => {
    it("should return monthly registration counts", async () => {
      queueSelect([
        { month: "2024-02", count: 900 },
        { month: "2024-03", count: 1200 },
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
