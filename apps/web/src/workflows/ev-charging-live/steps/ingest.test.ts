vi.mock("@motormetrics/database", () => ({
  db: {},
  evChargingEvents: {},
  evConnectorStatus: {},
  evLocationHourly: {},
  max: vi.fn(),
  sql: vi.fn(),
}));

import { ingestLiveSnapshot } from "./ingest";

describe("ingestLiveSnapshot", () => {
  it("should skip when no account key is configured", async () => {
    vi.stubEnv("LTA_DATAMALL_ACCOUNT_KEY", "");

    await expect(ingestLiveSnapshot()).resolves.toMatchObject({
      skipped: true,
      connectors: 0,
    });

    vi.unstubAllEnvs();
  });
});
