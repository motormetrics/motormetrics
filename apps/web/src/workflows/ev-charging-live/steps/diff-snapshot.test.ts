import { diffSnapshot, formatPrice, truncateToHour } from "./diff-snapshot";
import type { ConnectorRecord } from "./parse-batch";

const observedAt = new Date("2026-09-03T10:07:00+08:00");
const earlier = new Date("2026-09-03T08:00:00+08:00");

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
  operator: null,
  operationHours: null,
  position: null,
  plugType: null,
  powerRating: null,
  chargingSpeedKw: null,
  price: 0.7,
  priceType: "$/kWh",
  status: "available",
  ...overrides,
});

describe("diffSnapshot", () => {
  it("records a status event for connectors seen for the first time", () => {
    const diff = diffSnapshot(
      [connector({ evCpId: "A" })],
      new Map(),
      observedAt,
    );

    expect(diff.events).toEqual([
      {
        evCpId: "A",
        locationId: "L1",
        kind: "status",
        previousValue: null,
        value: "available",
        observedAt,
      },
    ]);
    expect(diff.statusChangedAt.get("A")).toBe(observedAt);
  });

  it("carries statusChangedAt forward when the status holds", () => {
    const previous = new Map([
      [
        "A",
        {
          evCpId: "A",
          status: "available" as const,
          statusChangedAt: earlier,
          price: 0.7,
          priceType: "$/kWh",
        },
      ],
    ]);

    const diff = diffSnapshot(
      [connector({ evCpId: "A" })],
      previous,
      observedAt,
    );

    expect(diff.events).toEqual([]);
    expect(diff.statusChangedAt.get("A")).toBe(earlier);
  });

  it("records status and price transitions", () => {
    const previous = new Map([
      [
        "A",
        {
          evCpId: "A",
          status: "available" as const,
          statusChangedAt: earlier,
          price: 0.7,
          priceType: "$/kWh",
        },
      ],
    ]);

    const diff = diffSnapshot(
      [connector({ evCpId: "A", status: "occupied", price: 0.75 })],
      previous,
      observedAt,
    );

    expect(diff.events).toEqual([
      expect.objectContaining({
        kind: "status",
        previousValue: "available",
        value: "occupied",
      }),
      expect.objectContaining({
        kind: "price",
        previousValue: "0.7 $/kWh",
        value: "0.75 $/kWh",
      }),
    ]);
  });

  it("ignores a price disappearing from the feed", () => {
    const previous = new Map([
      [
        "A",
        {
          evCpId: "A",
          status: "available" as const,
          statusChangedAt: earlier,
          price: 0.7,
          priceType: "$/kWh",
        },
      ],
    ]);

    const diff = diffSnapshot(
      [connector({ evCpId: "A", price: null })],
      previous,
      observedAt,
    );

    expect(diff.events).toEqual([]);
  });

  it("rolls connectors up into one hourly sample per location", () => {
    const diff = diffSnapshot(
      [
        connector({ evCpId: "A", status: "occupied" }),
        connector({ evCpId: "B", status: "unavailable" }),
        connector({ evCpId: "C" }),
        connector({ evCpId: "D", locationId: "L2" }),
      ],
      new Map(),
      observedAt,
    );

    expect(diff.hourly).toEqual([
      {
        locationId: "L1",
        hour: new Date("2026-09-03T02:00:00.000Z"),
        samples: 1,
        connectorSamples: 3,
        occupiedSamples: 1,
        unavailableSamples: 1,
      },
      {
        locationId: "L2",
        hour: new Date("2026-09-03T02:00:00.000Z"),
        samples: 1,
        connectorSamples: 1,
        occupiedSamples: 0,
        unavailableSamples: 0,
      },
    ]);
  });
});

describe("formatPrice", () => {
  it("joins price and unit, tolerating a missing unit", () => {
    expect(formatPrice(0.7, "$/kWh")).toBe("0.7 $/kWh");
    expect(formatPrice(0.7, null)).toBe("0.7");
    expect(formatPrice(null, "$/kWh")).toBeNull();
  });
});

describe("truncateToHour", () => {
  it("zeroes minutes, seconds and milliseconds in UTC", () => {
    expect(truncateToHour(new Date("2026-09-03T02:59:59.999Z"))).toEqual(
      new Date("2026-09-03T02:00:00.000Z"),
    );
  });
});
