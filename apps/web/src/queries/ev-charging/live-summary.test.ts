vi.mock("./snapshot", () => ({ getEvChargingSnapshot: vi.fn() }));

import { connector } from "./fixtures";
import { getEvChargingLiveSummary } from "./live-summary";
import { getEvChargingSnapshot } from "./snapshot";

const records = [
  connector({ evCpId: "A" }),
  connector({ evCpId: "B", status: "occupied" }),
  connector({ evCpId: "C", status: "unavailable", locationId: "L2" }),
  connector({ evCpId: "D", locationId: "L3", postalCode: "520618" }),
];

describe("getEvChargingLiveSummary", () => {
  beforeEach(() => {
    vi.mocked(getEvChargingSnapshot).mockResolvedValue({
      observedAt: "2026-09-03T12:55:00.000Z",
      records,
    });
  });

  it("should count connectors by status and distinct locations", async () => {
    await expect(getEvChargingLiveSummary()).resolves.toEqual({
      connectors: 4,
      locations: 3,
      available: 2,
      occupied: 1,
      unavailable: 1,
      observedAt: "2026-09-03T12:55:00.000Z",
    });
  });

  it("should restrict to a district", async () => {
    await expect(
      getEvChargingLiveSummary("tampines-pasir-ris"),
    ).resolves.toMatchObject({ connectors: 1, locations: 1, available: 1 });
  });

  it("should return zeros for an empty snapshot", async () => {
    vi.mocked(getEvChargingSnapshot).mockResolvedValueOnce({
      observedAt: null,
      records: [],
    });

    await expect(getEvChargingLiveSummary()).resolves.toEqual({
      connectors: 0,
      locations: 0,
      available: 0,
      occupied: 0,
      unavailable: 0,
      observedAt: null,
    });
  });
});
