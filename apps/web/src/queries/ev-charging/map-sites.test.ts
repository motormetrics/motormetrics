import { connector } from "./fixtures";
import { getEvChargingLocationUtilisation } from "./location-utilisation";
import { getEvChargingMapSites } from "./map-sites";
import { getEvChargingSnapshot } from "./snapshot";

vi.mock("./snapshot", () => ({ getEvChargingSnapshot: vi.fn() }));
vi.mock("./location-utilisation", () => ({
  getEvChargingLocationUtilisation: vi.fn().mockResolvedValue([]),
}));

describe("getEvChargingMapSites", () => {
  it("should place each location once with its status counts", async () => {
    vi.mocked(getEvChargingSnapshot).mockResolvedValue({
      observedAt: "2026-09-04T10:00:00.000Z",
      records: [
        connector({ evCpId: "A", latitude: 1.3, longitude: 103.8 }),
        connector({
          evCpId: "B",
          latitude: 1.3,
          longitude: 103.8,
          status: "occupied",
          powerRating: "DC",
          chargingSpeedKw: 120,
        }),
        connector({
          evCpId: "C",
          latitude: 1.3,
          longitude: 103.8,
          status: "unavailable",
        }),
        connector({
          evCpId: "D",
          locationId: "L2",
          stationName: "No coordinates",
        }),
      ],
    });

    await expect(getEvChargingMapSites()).resolves.toEqual([
      expect.objectContaining({
        locationId: "L1",
        latitude: 1.3,
        longitude: 103.8,
        connectors: 3,
        dcConnectors: 1,
        maxSpeedKw: 120,
        available: 1,
        occupied: 1,
        unavailable: 1,
        utilisationPercent: null,
      }),
    ]);
  });

  it("should attach the weekly utilisation where a location has one", async () => {
    vi.mocked(getEvChargingSnapshot).mockResolvedValue({
      observedAt: null,
      records: [connector({ evCpId: "A", latitude: 1.3, longitude: 103.8 })],
    });
    vi.mocked(getEvChargingLocationUtilisation).mockResolvedValueOnce([
      {
        ...connector({ evCpId: "A" }),
        utilisationPercent: 42.5,
        samples: 300,
      } as never,
    ]);

    const [site] = await getEvChargingMapSites();
    expect(site).toMatchObject({ utilisationPercent: 42.5 });
  });

  it("should use the first connector that carries coordinates", async () => {
    vi.mocked(getEvChargingSnapshot).mockResolvedValue({
      observedAt: null,
      records: [
        connector({ evCpId: "A" }),
        connector({ evCpId: "B", latitude: 1.35, longitude: 103.9 }),
      ],
    });

    const [site] = await getEvChargingMapSites();
    expect(site).toMatchObject({ latitude: 1.35, longitude: 103.9 });
  });
});
