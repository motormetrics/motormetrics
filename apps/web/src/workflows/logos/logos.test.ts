import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@motormetrics/logos", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@motormetrics/logos")>()),
  bootstrapManifest: vi.fn(),
  downloadLogo: vi.fn(),
  readManifest: vi.fn(),
  writeManifest: vi.fn(),
}));

vi.mock("@web/queries/cars/filter-options", () => ({
  getDistinctMakes: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

vi.mock("workflow", () => ({
  fetch: vi.fn(),
}));

import {
  bootstrapManifest,
  downloadLogo,
  type LogoManifest,
  readManifest,
  writeManifest,
} from "@motormetrics/logos";
import { getDistinctMakes } from "@web/queries/cars/filter-options";
import { revalidateTag } from "next/cache";
import { logosWorkflow } from "./index";

const found = (make: string) => ({
  make,
  status: "found" as const,
  url: `https://blob/logos/${make}.png`,
  pathname: `logos/${make}.png`,
  sourceUrl: null,
  checkedAt: "2026-09-05T00:00:00.000Z",
  lastError: null,
});

const manifestWith = (...makes: string[]): LogoManifest => ({
  version: 1,
  updatedAt: "2026-09-05T00:00:00.000Z",
  logos: Object.fromEntries(makes.map((make) => [make, found(make)])),
});

describe("logosWorkflow", () => {
  beforeEach(() => {
    vi.mocked(readManifest).mockReset();
    vi.mocked(bootstrapManifest).mockReset();
    vi.mocked(downloadLogo).mockReset();
    vi.mocked(writeManifest).mockReset();
    vi.mocked(getDistinctMakes).mockReset();
    vi.mocked(revalidateTag).mockReset();
    vi.mocked(writeManifest).mockImplementation(async (manifest) => manifest);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("does nothing when the manifest already covers every make", async () => {
    vi.mocked(readManifest).mockResolvedValue(manifestWith("toyota", "bmw"));
    vi.mocked(getDistinctMakes).mockResolvedValue([
      { make: "TOYOTA" },
      { make: "BMW" },
    ]);

    const result = await logosWorkflow();

    expect(result.fetched).toBe(0);
    expect(downloadLogo).not.toHaveBeenCalled();
    expect(writeManifest).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("fetches only unseen makes, records misses, and revalidates", async () => {
    vi.mocked(readManifest).mockResolvedValue(manifestWith("toyota"));
    vi.mocked(getDistinctMakes).mockResolvedValue([
      { make: "TOYOTA" },
      { make: "BYD" },
      { make: "ZEEKR" },
    ]);
    vi.mocked(downloadLogo).mockImplementation(async (make) =>
      make === "byd"
        ? {
            success: true,
            make,
            url: "https://blob/logos/byd.png",
            pathname: "logos/byd.png",
            sourceUrl: "https://source/byd-logo.png",
          }
        : {
            success: false,
            make,
            sourceUrl: "https://source/zeekr-logo.png",
            error: "Failed to fetch logo: 404",
          },
    );

    const result = await logosWorkflow();

    expect(result).toMatchObject({ fetched: 1, missing: 1, skipped: 0 });
    expect(downloadLogo).toHaveBeenCalledTimes(2);
    const written = vi.mocked(writeManifest).mock.calls[0][0];
    expect(Object.keys(written.logos).sort()).toEqual([
      "byd",
      "toyota",
      "zeekr",
    ]);
    expect(written.logos.zeekr.status).toBe("missing");
    expect(written.logos.byd.status).toBe("found");
    expect(revalidateTag).toHaveBeenCalledWith("logos", "max");
  });

  it("leaves a make out of the manifest on a non-404 failure", async () => {
    vi.mocked(readManifest).mockResolvedValue(manifestWith());
    vi.mocked(getDistinctMakes).mockResolvedValue([{ make: "BYD" }]);
    vi.mocked(downloadLogo).mockResolvedValue({
      success: false,
      make: "byd",
      sourceUrl: "https://source/byd-logo.png",
      error: "fetch failed",
    });

    const result = await logosWorkflow();

    expect(result).toMatchObject({ fetched: 0, missing: 0, skipped: 1 });
    expect(writeManifest).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("bootstraps and writes a manifest when none exists", async () => {
    vi.mocked(readManifest).mockResolvedValue(null);
    vi.mocked(bootstrapManifest).mockResolvedValue(manifestWith("toyota"));
    vi.mocked(getDistinctMakes).mockResolvedValue([{ make: "TOYOTA" }]);

    await logosWorkflow();

    expect(bootstrapManifest).toHaveBeenCalledTimes(1);
    expect(writeManifest).toHaveBeenCalledTimes(1);
    expect(downloadLogo).not.toHaveBeenCalled();
  });
});
