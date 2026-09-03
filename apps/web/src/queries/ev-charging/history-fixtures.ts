import { vi } from "vitest";

/** Stand-in for the stored-locations subquery: column keys, no SQL. */
export const fakeLocations = {
  locationId: "locations.location_id",
  stationName: "locations.station_name",
  address: "locations.address",
  postalCode: "locations.postal_code",
  operator: "locations.operator",
  connectors: "locations.connectors",
  dcConnectors: "locations.dc_connectors",
  maxSpeedKw: "locations.max_speed_kw",
  minPricePerKwh: "locations.min_price_per_kwh",
};

export const storedLocationsMock = () => ({
  storedLocationsSubquery: vi.fn(() => fakeLocations),
  storedLocationColumns: vi.fn(() => fakeLocations),
  districtPredicate: vi.fn(),
  toStoredLocation: (row: Record<string, unknown>) => ({
    locationId: row.locationId,
    stationName: row.stationName,
    address: row.address,
    postalCode: row.postalCode,
    operator: row.operator,
    connectors: row.connectors,
    dcConnectors: row.dcConnectors,
    maxSpeedKw: row.maxSpeedKw,
    minPricePerKwh: row.minPricePerKwh,
  }),
});

export const storedRow = (overrides: Record<string, unknown> = {}) => ({
  locationId: "L1",
  stationName: "Station",
  address: null,
  postalCode: "188537",
  operator: "Op",
  connectors: 2,
  dcConnectors: 0,
  maxSpeedKw: 7.4,
  minPricePerKwh: 0.7,
  ...overrides,
});
