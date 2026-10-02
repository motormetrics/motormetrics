import { EV_CHARGING_LIVE_CACHE_TAG } from "@web/lib/cache-tags";
import { getEvChargingSnapshot } from "@web/queries/ev-charging/snapshot";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";

const storedRow = {
  evCpId: "A",
  locationId: "103851_018989",
  chargerId: "C1",
  stationName: "Plaza Singapura",
  address: "68 Orchard Road",
  postalCode: "238839",
  longitude: 103.851,
  latitude: 1.301,
  operator: "SP Mobility",
  operationHours: "24 hours",
  position: "B2",
  plugType: "CCS2",
  powerRating: "DC",
  chargingSpeedKw: 50,
  price: 0.6,
  priceType: "$/kWh",
  status: "occupied",
  observedAt: new Date("2026-09-03T12:55:00Z"),
};

describe("getEvChargingSnapshot", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should return an empty snapshot before any batch is stored", async () => {
    queueSelect([]);

    await expect(getEvChargingSnapshot()).resolves.toEqual({
      observedAt: null,
      records: [],
    });
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith(EV_CHARGING_LIVE_CACHE_TAG);
  });

  it("should return the stored connectors stamped with the batch time", async () => {
    queueSelect([storedRow]);

    const { observedAt: _observedAt, ...record } = storedRow;

    await expect(getEvChargingSnapshot()).resolves.toEqual({
      observedAt: "2026-09-03T12:55:00.000Z",
      records: [record],
    });
  });
});
