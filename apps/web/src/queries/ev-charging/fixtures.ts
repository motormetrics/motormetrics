import type { ConnectorRecord } from "@web/lib/ev-charging";

/** A connector with sensible defaults; override what the test cares about. */
export const connector = (
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
