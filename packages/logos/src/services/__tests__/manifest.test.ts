import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LogoEntry, LogoManifest } from "../../types";
import {
  bootstrapManifest,
  MANIFEST_PATHNAME,
  manifestToLogos,
  readManifest,
  writeManifest,
} from "../manifest";

const { get, list, put } = vi.hoisted(() => ({
  get: vi.fn(),
  list: vi.fn(),
  put: vi.fn(),
}));
vi.mock("@vercel/blob", () => ({ get, list, put }));

const timestamp = "2026-10-04T00:00:00.000Z";
const entry: LogoEntry = {
  make: "toyota",
  status: "found",
  url: "https://blob/logos/toyota.png",
  pathname: "logos/toyota.png",
  sourceUrl: null,
  checkedAt: "2026-09-01T00:00:00.000Z",
  lastError: null,
};
const manifest: LogoManifest = {
  version: 1,
  updatedAt: "2026-09-01T00:00:00.000Z",
  logos: { toyota: entry },
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(timestamp));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("readManifest", () => {
  it("parses a stored manifest with one Blob read", async () => {
    get.mockResolvedValue({
      statusCode: 200,
      stream: new Response(JSON.stringify(manifest)).body,
    });
    await expect(readManifest()).resolves.toEqual(manifest);
    expect(get).toHaveBeenCalledExactlyOnceWith(MANIFEST_PATHNAME, {
      access: "public",
    });
    expect(list).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });

  it.each([
    null,
    { statusCode: 304 },
  ])("returns null when no readable manifest is available", async (result) => {
    get.mockResolvedValue(result);
    await expect(readManifest()).resolves.toBeNull();
  });

  it("rejects malformed JSON", async () => {
    get.mockResolvedValue({
      statusCode: 200,
      stream: new Response("invalid JSON").body,
    });
    await expect(readManifest()).rejects.toBeInstanceOf(SyntaxError);
  });

  it("propagates Blob read failures", async () => {
    const error = new Error("Blob unavailable");
    get.mockRejectedValue(error);
    await expect(readManifest()).rejects.toBe(error);
  });
});

describe("writeManifest", () => {
  it("refreshes the timestamp and preserves entries without mutating the input", async () => {
    const original = structuredClone(manifest);
    const next = { ...manifest, updatedAt: timestamp };
    put.mockResolvedValue({ url: "https://blob/logos/manifest.json" });

    await expect(writeManifest(manifest)).resolves.toEqual(next);
    expect(manifest).toEqual(original);
    expect(put).toHaveBeenCalledExactlyOnceWith(
      MANIFEST_PATHNAME,
      JSON.stringify(next, null, 2),
      {
        access: "public",
        contentType: "application/json",
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      },
    );
    expect(get).not.toHaveBeenCalled();
    expect(list).not.toHaveBeenCalled();
  });

  it("propagates Blob write failures", async () => {
    const error = new Error("Write failed");
    put.mockRejectedValue(error);
    await expect(writeManifest(manifest)).rejects.toBe(error);
  });
});

describe("bootstrapManifest", () => {
  it("creates an empty manifest when no logos exist", async () => {
    list.mockResolvedValue({ blobs: [], hasMore: false });
    await expect(bootstrapManifest()).resolves.toEqual({
      version: 1,
      updatedAt: timestamp,
      logos: {},
    });
    expect(list).toHaveBeenCalledExactlyOnceWith({
      prefix: "logos/",
      cursor: undefined,
      limit: 1000,
    });
    expect(put).not.toHaveBeenCalled();
  });

  it("collects every page and skips the manifest itself", async () => {
    list
      .mockResolvedValueOnce({
        blobs: [
          {
            pathname: MANIFEST_PATHNAME,
            url: "https://blob/logos/manifest.json",
          },
          {
            pathname: "logos/toyota.png",
            url: "https://blob/logos/toyota.png",
          },
        ],
        hasMore: true,
        cursor: "page-two",
      })
      .mockResolvedValueOnce({
        blobs: [
          {
            pathname: "logos/mercedes-benz.svg",
            url: "https://blob/logos/mercedes-benz.svg",
          },
        ],
        hasMore: false,
        cursor: "unused-cursor",
      });

    await expect(bootstrapManifest()).resolves.toEqual({
      version: 1,
      updatedAt: timestamp,
      logos: {
        toyota: { ...entry, checkedAt: timestamp },
        "mercedes-benz": {
          make: "mercedes-benz",
          status: "found",
          url: "https://blob/logos/mercedes-benz.svg",
          pathname: "logos/mercedes-benz.svg",
          sourceUrl: null,
          checkedAt: timestamp,
          lastError: null,
        },
      },
    });
    expect(list).toHaveBeenCalledTimes(2);
    expect(list).toHaveBeenNthCalledWith(1, {
      prefix: "logos/",
      cursor: undefined,
      limit: 1000,
    });
    expect(list).toHaveBeenNthCalledWith(2, {
      prefix: "logos/",
      cursor: "page-two",
      limit: 1000,
    });
    expect(put).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it("propagates failures on later pages instead of returning a partial manifest", async () => {
    const error = new Error("List failed");
    list
      .mockResolvedValueOnce({
        blobs: [{ pathname: "logos/toyota.png", url: entry.url }],
        hasMore: true,
        cursor: "page-two",
      })
      .mockRejectedValueOnce(error);
    await expect(bootstrapManifest()).rejects.toBe(error);
  });
});

describe("manifestToLogos", () => {
  it("excludes entries missing a URL or pathname even when their status is found", () => {
    expect(
      manifestToLogos({
        ...manifest,
        logos: {
          toyota: entry,
          "no-url": { ...entry, make: "no-url", url: null },
          "no-pathname": { ...entry, make: "no-pathname", pathname: null },
          missing: { ...entry, make: "missing", status: "missing" },
        },
      }),
    ).toEqual([{ make: "toyota", url: entry.url, filename: "toyota.png" }]);
  });
});
