import { describe, expect, it, vi } from "vitest";
import type { LogoManifest } from "../types";
import { manifestToLogos } from "./manifest";

// manifestToLogos is pure, but importing ./manifest pulls in @vercel/blob,
// which kicks off an unawaited feature-detection promise at module scope.
// A factory mock keeps the real module out of the test run entirely.
vi.mock("@vercel/blob", () => ({
  get: vi.fn(),
  list: vi.fn(),
  put: vi.fn(),
}));

const manifest: LogoManifest = {
  version: 1,
  updatedAt: "2026-09-05T00:00:00.000Z",
  logos: {
    toyota: {
      make: "toyota",
      status: "found",
      url: "https://blob/logos/toyota.png",
      pathname: "logos/toyota.png",
      sourceUrl: "https://source/toyota-logo.png",
      checkedAt: "2026-09-05T00:00:00.000Z",
      lastError: null,
    },
    byd: {
      make: "byd",
      status: "manual",
      url: "https://blob/logos/byd.png",
      pathname: "logos/byd.png",
      sourceUrl: null,
      checkedAt: "2026-09-05T00:00:00.000Z",
      lastError: null,
    },
    zeekr: {
      make: "zeekr",
      status: "missing",
      url: null,
      pathname: null,
      sourceUrl: "https://source/zeekr-logo.png",
      checkedAt: "2026-09-05T00:00:00.000Z",
      lastError: "Failed to fetch logo: 404",
    },
  },
};

describe("manifestToLogos", () => {
  it("should keep found and manual entries, drops missing, sorts by make", () => {
    expect(manifestToLogos(manifest)).toEqual([
      { make: "byd", url: "https://blob/logos/byd.png", filename: "byd.png" },
      {
        make: "toyota",
        url: "https://blob/logos/toyota.png",
        filename: "toyota.png",
      },
    ]);
  });

  it("should return an empty list for an empty manifest", () => {
    expect(manifestToLogos({ version: 1, updatedAt: "", logos: {} })).toEqual(
      [],
    );
  });
});
