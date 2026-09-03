vi.mock("./stored-locations", async () => {
  const { storedLocationsMock } = await import("./history-fixtures");
  return storedLocationsMock();
});

import { cacheLifeMock, queueSelect, resetDbMocks } from "../test-utils";
import { storedRow } from "./history-fixtures";
import { getEvChargingLocationUtilisation } from "./location-utilisation";
import { districtPredicate } from "./stored-locations";

describe("getEvChargingLocationUtilisation", () => {
  beforeEach(() => {
    resetDbMocks();
    vi.mocked(districtPredicate).mockClear();
  });

  it("should map utilisation rows onto locations", async () => {
    queueSelect([
      storedRow({ utilisationPercent: 82.5, samples: 300 }),
      storedRow({ locationId: "L2", utilisationPercent: 10, samples: null }),
    ]);

    const rows = await getEvChargingLocationUtilisation({ order: "busiest" });

    expect(rows).toEqual([
      expect.objectContaining({
        locationId: "L1",
        connectors: 2,
        utilisationPercent: 82.5,
        samples: 300,
      }),
      expect.objectContaining({ locationId: "L2", samples: 0 }),
    ]);
    expect(cacheLifeMock).toHaveBeenCalledWith("hours");
    expect(districtPredicate).toHaveBeenCalledWith(
      "locations.postal_code",
      undefined,
    );
  });

  it("should pass the district through and support quietest order", async () => {
    queueSelect([]);

    await expect(
      getEvChargingLocationUtilisation({
        order: "quietest",
        district: "middle-road-bugis",
        limit: 3,
        days: 1,
      }),
    ).resolves.toEqual([]);
    expect(districtPredicate).toHaveBeenCalledWith(
      "locations.postal_code",
      "middle-road-bugis",
    );
  });
});
