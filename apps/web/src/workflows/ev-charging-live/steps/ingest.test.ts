const insertChain = {
  values: vi.fn(() => ({ onConflictDoUpdate: vi.fn(async () => undefined) })),
};
const selectChain = {
  from: vi.fn<() => Promise<unknown[]>>(async () => []),
};

vi.mock("@motormetrics/database", () => ({
  db: {
    select: vi.fn(() => selectChain),
    insert: vi.fn(() => insertChain),
  },
  evChargingEvents: {},
  evConnectorStatus: { evCpId: "ev_cp_id", observedAt: "observed_at" },
  evLocationHourly: { locationId: "location_id", hour: "hour" },
  max: vi.fn(),
  sql: Object.assign(vi.fn(), { raw: vi.fn() }),
}));

vi.mock("@web/lib/ev-charging", () => ({
  extractLastUpdated: vi.fn(),
  fetchBatch: vi.fn(),
  parseBatch: vi.fn(),
}));

import { db } from "@motormetrics/database";
import {
  extractLastUpdated,
  fetchBatch,
  parseBatch,
} from "@web/lib/ev-charging";
import { ingestLiveSnapshot } from "./ingest";

const record = (evCpId: string, locationId = "L1") => ({
  evCpId,
  locationId,
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
  powerRating: "AC",
  chargingSpeedKw: null,
  price: 0.7,
  priceType: "$/kWh",
  status: "available" as const,
});

describe("ingestLiveSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectChain.from.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should skip when no account key is configured", async () => {
    vi.stubEnv("LTA_DATAMALL_ACCOUNT_KEY", "");

    await expect(ingestLiveSnapshot()).resolves.toMatchObject({
      skipped: true,
      connectors: 0,
    });
    expect(fetchBatch).not.toHaveBeenCalled();
  });

  it("should throw when the file parses to nothing", async () => {
    vi.stubEnv("LTA_DATAMALL_ACCOUNT_KEY", "key");
    vi.mocked(fetchBatch).mockResolvedValueOnce({});
    vi.mocked(parseBatch).mockReturnValueOnce([]);

    await expect(ingestLiveSnapshot()).rejects.toThrow("zero connectors");
  });

  it("should skip a batch that is already stored", async () => {
    vi.stubEnv("LTA_DATAMALL_ACCOUNT_KEY", "key");
    const observedAt = new Date("2026-09-03T12:55:00Z");
    vi.mocked(fetchBatch).mockResolvedValueOnce({});
    vi.mocked(parseBatch).mockReturnValueOnce([record("A")]);
    vi.mocked(extractLastUpdated).mockReturnValueOnce(observedAt);
    selectChain.from.mockResolvedValueOnce([{ observedAt }]);

    await expect(ingestLiveSnapshot()).resolves.toMatchObject({
      skipped: true,
      observedAt: observedAt.toISOString(),
    });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("should write status, events and hourly rows for a new batch", async () => {
    vi.stubEnv("LTA_DATAMALL_ACCOUNT_KEY", "key");
    vi.mocked(fetchBatch).mockResolvedValueOnce({});
    vi.mocked(parseBatch).mockReturnValueOnce([record("A"), record("B", "L2")]);
    vi.mocked(extractLastUpdated).mockReturnValueOnce(null);
    selectChain.from
      .mockResolvedValueOnce([{ observedAt: null }])
      .mockResolvedValueOnce([]);

    const result = await ingestLiveSnapshot();

    expect(result).toMatchObject({
      skipped: false,
      connectors: 2,
      locations: 2,
      events: 2,
    });
    // status upsert, events insert, hourly upsert
    expect(db.insert).toHaveBeenCalledTimes(3);
  });
});
