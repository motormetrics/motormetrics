import { describe, expect, it, vi } from "vitest";

const { readManifestMock, cacheLifeMock, cacheTagMock } = vi.hoisted(() => ({
  readManifestMock: vi.fn(),
  cacheLifeMock: vi.fn(),
  cacheTagMock: vi.fn(),
}));

vi.mock("@motormetrics/logos/services/manifest", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@motormetrics/logos/services/manifest")
  >()),
  readManifest: readManifestMock,
}));

vi.mock("next/cache", () => ({
  cacheLife: cacheLifeMock,
  cacheTag: cacheTagMock,
}));

import { buildLogoMap, getAllCarLogos } from "./logos";

const entry = (make: string, status: "found" | "missing") => ({
  make,
  status,
  url: status === "found" ? `https://blob/logos/${make}.png` : null,
  pathname: status === "found" ? `logos/${make}.png` : null,
  sourceUrl: null,
  checkedAt: "2026-09-05T00:00:00.000Z",
  lastError: null,
});

describe("getAllCarLogos", () => {
  beforeEach(() => {
    readManifestMock.mockReset();
    cacheLifeMock.mockClear();
    cacheTagMock.mockClear();
  });

  it("maps the manifest to logos and tags the cache", async () => {
    readManifestMock.mockResolvedValueOnce({
      version: 1,
      updatedAt: "",
      logos: {
        toyota: entry("toyota", "found"),
        zeekr: entry("zeekr", "missing"),
      },
    });

    const result = await getAllCarLogos();

    expect(result).toEqual({
      logos: [
        {
          make: "toyota",
          url: "https://blob/logos/toyota.png",
          filename: "toyota.png",
        },
      ],
    });
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith("logos");
  });

  it("returns an empty list when no manifest exists yet", async () => {
    readManifestMock.mockResolvedValueOnce(null);

    expect(await getAllCarLogos()).toEqual({ logos: [] });
  });

  it("returns an error when blob access fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    readManifestMock.mockRejectedValueOnce(new Error("blob error"));

    expect(await getAllCarLogos()).toEqual({ error: "blob error" });
    consoleSpy.mockRestore();
  });

  it("handles non-Error rejections", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    readManifestMock.mockRejectedValueOnce("string error");

    expect(await getAllCarLogos()).toEqual({ error: "Failed to fetch logos" });
    consoleSpy.mockRestore();
  });
});

describe("buildLogoMap", () => {
  it("keys logo urls by slug and skips makes without one", () => {
    expect(
      buildLogoMap([
        { make: "Mercedes Benz", filename: "mb.png", url: "https://x/mb.png" },
        { make: "Saab", filename: "", url: "" },
      ]),
    ).toEqual({ "mercedes-benz": "https://x/mb.png" });
  });
});
