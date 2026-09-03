import type { ConnectorRecord } from "@web/lib/ev-charging";
import { groupLocations, inDistrict } from "./locations";

const connector = (
  overrides: Partial<ConnectorRecord> & Pick<ConnectorRecord, "evCpId">,
): ConnectorRecord => ({
  locationId: "L1",
  chargerId: null,
  stationName: "Station",
  address: null,
  postalCode: "188537",
  longitude: null,
  latitude: null,
  operator: null,
  operationHours: null,
  position: null,
  plugType: null,
  powerRating: "AC",
  chargingSpeedKw: 7.4,
  price: 0.7,
  priceType: "$/kWh",
  status: "available",
  ...overrides,
});

describe("groupLocations", () => {
  it("should roll connectors up per location with counts, top speed and lowest price", () => {
    const locations = groupLocations([
      connector({ evCpId: "A" }),
      connector({
        evCpId: "B",
        powerRating: "DC",
        chargingSpeedKw: 120,
        price: 0.65,
      }),
      connector({ evCpId: "C", price: 2, priceType: "$/h" }),
      connector({ evCpId: "D", locationId: "L2", stationName: "Other" }),
    ]);

    expect(locations).toEqual([
      expect.objectContaining({
        locationId: "L1",
        connectors: 3,
        dcConnectors: 1,
        maxSpeedKw: 120,
        minPricePerKwh: 0.65,
      }),
      expect.objectContaining({ locationId: "L2", connectors: 1 }),
    ]);
  });
});

describe("inDistrict", () => {
  it("should match the postal sector and treat unknown slugs as all Singapore", () => {
    expect(inDistrict("188537", "middle-road-bugis")).toBe(true);
    expect(inDistrict("520618", "middle-road-bugis")).toBe(false);
    expect(inDistrict(null, "middle-road-bugis")).toBe(false);
    expect(inDistrict("520618", undefined)).toBe(true);
    expect(inDistrict("520618", "nowhere")).toBe(true);
  });
});
