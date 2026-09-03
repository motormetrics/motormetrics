import type { ConnectorRecord } from "@web/lib/ev-charging";
import { deriveChargingStats, formatPerKwh } from "./price-stats";

const connector = (
  overrides: Partial<ConnectorRecord> & Pick<ConnectorRecord, "evCpId">,
): ConnectorRecord => ({
  locationId: "L1",
  chargerId: null,
  stationName: null,
  address: null,
  postalCode: null,
  longitude: null,
  latitude: null,
  operator: "Op A",
  operationHours: null,
  position: null,
  plugType: null,
  powerRating: "AC",
  chargingSpeedKw: null,
  price: 0.7,
  priceType: "$/kWh",
  status: "available",
  ...overrides,
});

describe("deriveChargingStats", () => {
  it("should count connectors, locations, DC sites and operators", () => {
    const stats = deriveChargingStats([
      connector({ evCpId: "A" }),
      connector({
        evCpId: "B",
        locationId: "L2",
        powerRating: "DC",
        price: 0.5,
      }),
      connector({
        evCpId: "C",
        locationId: "L3",
        operator: "Op B",
        price: 0.9,
      }),
    ]);

    expect(stats).toEqual({
      connectors: 3,
      locations: 3,
      dcLocations: 1,
      operators: 2,
      cheapestAc: 0.7,
      cheapestDc: 0.5,
      medianPerKwh: 0.7,
    });
  });

  it("should ignore hourly tariffs and return nulls without prices", () => {
    const stats = deriveChargingStats([
      connector({ evCpId: "A", price: 2, priceType: "$/h" }),
    ]);

    expect(stats.cheapestAc).toBeNull();
    expect(stats.medianPerKwh).toBeNull();
  });

  it("should average the two middle values for an even count", () => {
    const stats = deriveChargingStats([
      connector({ evCpId: "A", price: 0.4 }),
      connector({ evCpId: "B", locationId: "L2", price: 0.8 }),
    ]);

    expect(stats.medianPerKwh).toBeCloseTo(0.6);
  });
});

describe("formatPerKwh", () => {
  it("should format to two decimals and handle missing prices", () => {
    expect(formatPerKwh(0.4)).toBe("$0.40/kWh");
    expect(formatPerKwh(null)).toBe("not advertised");
  });
});
