vi.mock("@motormetrics/database", () => ({
  db: {},
  evChargingEvents: {},
  evConnectorStatus: {},
  evLocationHourly: {},
  sql: vi.fn(),
}));

import { extractDownloadLink, fetchBatch, ingestLiveSnapshot } from "./ingest";

describe("extractDownloadLink", () => {
  it("reads the link from the shapes DataMall uses", () => {
    expect(extractDownloadLink({ Link: "https://a" })).toBe("https://a");
    expect(extractDownloadLink({ value: [{ Link: "https://b" }] })).toBe(
      "https://b",
    );
    expect(extractDownloadLink({ value: [{ link: "https://c" }] })).toBe(
      "https://c",
    );
    expect(extractDownloadLink({ Link: "not a url" })).toBeNull();
    expect(extractDownloadLink(null)).toBeNull();
  });
});

describe("fetchBatch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the account key, then downloads the presigned file", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ value: [{ Link: "https://s3/file.json" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ value: [] }),
      });

    await expect(fetchBatch("key-123")).resolves.toEqual({ value: [] });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://datamall2.mytransport.sg/ltaodataservice/EVCBatch",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      headers: { AccountKey: "key-123" },
    });
    expect(fetchMock.mock.calls[1][0]).toBe("https://s3/file.json");
  });

  it("throws when the link request fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    await expect(fetchBatch("bad")).rejects.toThrow("401 Unauthorized");
  });
});

describe("ingestLiveSnapshot", () => {
  it("skips when no account key is configured", async () => {
    vi.stubEnv("LTA_DATAMALL_ACCOUNT_KEY", "");

    await expect(ingestLiveSnapshot()).resolves.toMatchObject({
      skipped: true,
      connectors: 0,
    });

    vi.unstubAllEnvs();
  });
});
