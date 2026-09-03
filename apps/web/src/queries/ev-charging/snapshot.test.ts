vi.mock("@web/lib/ev-charging", () => ({
  extractLastUpdated: vi.fn(),
  fetchBatch: vi.fn(),
  parseBatch: vi.fn(),
}));

import {
  extractLastUpdated,
  fetchBatch,
  parseBatch,
} from "@web/lib/ev-charging";
import { cacheLifeMock } from "../test-utils";
import { getEvChargingSnapshot } from "./snapshot";

describe("getEvChargingSnapshot", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("should return an empty snapshot without an account key", async () => {
    vi.stubEnv("LTA_DATAMALL_ACCOUNT_KEY", "");

    await expect(getEvChargingSnapshot()).resolves.toEqual({
      observedAt: null,
      records: [],
    });
    expect(fetchBatch).not.toHaveBeenCalled();
    expect(cacheLifeMock).toHaveBeenCalledWith("minutes");
  });

  it("should fetch, parse and stamp the feed time", async () => {
    vi.stubEnv("LTA_DATAMALL_ACCOUNT_KEY", "key");
    vi.mocked(fetchBatch).mockResolvedValueOnce({ raw: true });
    vi.mocked(parseBatch).mockReturnValueOnce([{ evCpId: "A" } as never]);
    vi.mocked(extractLastUpdated).mockReturnValueOnce(
      new Date("2026-09-03T12:55:00Z"),
    );

    await expect(getEvChargingSnapshot()).resolves.toEqual({
      observedAt: "2026-09-03T12:55:00.000Z",
      records: [{ evCpId: "A" }],
    });
    expect(fetchBatch).toHaveBeenCalledWith("key");
  });

  it("should leave observedAt null when the feed carries no time", async () => {
    vi.stubEnv("LTA_DATAMALL_ACCOUNT_KEY", "key");
    vi.mocked(fetchBatch).mockResolvedValueOnce({});
    vi.mocked(parseBatch).mockReturnValueOnce([]);
    vi.mocked(extractLastUpdated).mockReturnValueOnce(null);

    await expect(getEvChargingSnapshot()).resolves.toEqual({
      observedAt: null,
      records: [],
    });
  });
});
