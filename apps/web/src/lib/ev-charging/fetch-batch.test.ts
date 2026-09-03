import { extractDownloadLink, fetchBatch } from "./fetch-batch";

describe("extractDownloadLink", () => {
  it("should read the link from the shapes DataMall uses", () => {
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

  it("should send the account key, then download the presigned file", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ value: [{ Link: "https://s3/file.json" }] }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ value: [] }) });

    await expect(fetchBatch("key-123")).resolves.toEqual({ value: [] });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://datamall2.mytransport.sg/ltaodataservice/EVCBatch",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      headers: { AccountKey: "key-123" },
    });
    expect(fetchMock.mock.calls[1][0]).toBe("https://s3/file.json");
  });

  it("should throw when the link request fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    await expect(fetchBatch("bad")).rejects.toThrow("401 Unauthorized");
  });
});
