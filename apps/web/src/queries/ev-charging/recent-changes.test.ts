vi.mock("./stored-locations", async () => {
  const { storedLocationsMock } = await import("./history-fixtures");
  return storedLocationsMock();
});

import { cacheLifeMock, queueSelect, resetDbMocks } from "../test-utils";
import { storedRow } from "./history-fixtures";
import { getEvChargingRecentChanges } from "./recent-changes";

describe("getEvChargingRecentChanges", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should return empty lists before the first ingest", async () => {
    queueSelect([{ observedAt: null }]);

    await expect(getEvChargingRecentChanges()).resolves.toEqual({
      newLocations: [],
      priceChanges: [],
    });
    expect(cacheLifeMock).toHaveBeenCalledWith("hours");
  });

  it("should map new locations and price changes", async () => {
    const spotted = new Date("2026-09-02T02:00:00Z");
    const changed = new Date("2026-09-03T02:00:00Z");
    queueSelect(
      [{ observedAt: new Date("2026-09-01T00:00:00Z") }],
      [storedRow({ spottedAt: spotted, newConnectors: 3 })],
      [
        storedRow({
          locationId: "L2",
          observedAt: changed,
          previousValue: "0.7 $/kWh",
          value: "0.75 $/kWh",
          connectorsChanged: 2,
        }),
      ],
    );

    const result = await getEvChargingRecentChanges(7);

    expect(result.newLocations).toEqual([
      expect.objectContaining({
        locationId: "L1",
        spottedAt: spotted.toISOString(),
        newConnectors: 3,
      }),
    ]);
    expect(result.priceChanges).toEqual([
      expect.objectContaining({
        locationId: "L2",
        observedAt: changed.toISOString(),
        previousValue: "0.7 $/kWh",
        value: "0.75 $/kWh",
        connectorsChanged: 2,
      }),
    ]);
  });
});
