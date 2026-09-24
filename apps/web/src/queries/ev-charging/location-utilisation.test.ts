import { EV_CHARGING_LIVE_CACHE_TAG } from "@web/lib/cache-tags";

vi.mock("@web/queries/ev-charging/stored-locations", async () => {
  const { storedLocationsMock } = await import(
    "@web/queries/ev-charging/history-fixtures"
  );
  return storedLocationsMock();
});

import { storedRow } from "@web/queries/ev-charging/history-fixtures";
import { getEvChargingLocationUtilisation } from "@web/queries/ev-charging/location-utilisation";
import { districtPredicate } from "@web/queries/ev-charging/stored-locations";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";

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
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith(EV_CHARGING_LIVE_CACHE_TAG);
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
