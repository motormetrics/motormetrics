import { describe, expect, it, vi } from "vitest";

const {
  redisGet,
  redisSet,
  getLogoMock,
  listLogosMock,
  downloadLogoMock,
  normaliseMakeMock,
} = vi.hoisted(() => ({
  redisGet: vi.fn(),
  redisSet: vi.fn(),
  getLogoMock: vi.fn(),
  listLogosMock: vi.fn(),
  downloadLogoMock: vi.fn(),
  normaliseMakeMock: vi.fn((value: string) => value.toLowerCase()),
}));

vi.mock("@motormetrics/utils", () => ({
  redis: {
    get: redisGet,
    set: redisSet,
  },
}));

vi.mock("@logos/services/blob", () => ({
  getLogo: getLogoMock,
  listLogos: listLogosMock,
}));

vi.mock("@logos/services/scraper", () => ({
  downloadLogo: downloadLogoMock,
}));

vi.mock("@logos/utils/normalise-make", () => ({
  normaliseMake: normaliseMakeMock,
}));

import { getAllCarLogos, getCarLogo } from "./logos";

describe("car logo queries", () => {
  beforeEach(() => {
    redisGet.mockReset();
    redisSet.mockReset();
    getLogoMock.mockReset();
    listLogosMock.mockReset();
    downloadLogoMock.mockReset();
    normaliseMakeMock.mockClear();
  });

  it("returns cached logos immediately", async () => {
    const cachedLogo = { make: "tesla", filename: "logo.svg", url: "/logo" };
    redisGet.mockResolvedValueOnce(cachedLogo);

    const logo = await getCarLogo("Tesla");

    expect(logo).toEqual(cachedLogo);
    expect(getLogoMock).not.toHaveBeenCalled();
    expect(normaliseMakeMock).toHaveBeenCalledWith("Tesla");
  });

  it("downloads and caches a logo when cache/blob miss", async () => {
    redisGet.mockResolvedValueOnce(undefined);
    getLogoMock.mockResolvedValueOnce(undefined);
    downloadLogoMock.mockResolvedValueOnce({
      success: true,
      logo: { make: "tesla", filename: "tesla.svg", url: "/blob/tesla.svg" },
    });
    redisSet.mockResolvedValue(undefined);

    const logo = await getCarLogo("Tesla");

    expect(logo).toEqual({
      make: "tesla",
      filename: "tesla.svg",
      url: "/blob/tesla.svg",
    });
    expect(redisSet).toHaveBeenCalledWith("logo:tesla", JSON.stringify(logo));
  });

  it("caches negative results when a download fails", async () => {
    redisGet.mockResolvedValueOnce(undefined);
    getLogoMock.mockResolvedValueOnce(undefined);
    downloadLogoMock.mockResolvedValueOnce({ success: false });

    const logo = await getCarLogo("Unknown");

    expect(logo).toEqual({
      make: "unknown",
      filename: "",
      url: "",
    });
    expect(redisSet).toHaveBeenLastCalledWith(
      "logo:unknown",
      JSON.stringify(logo),
    );
  });

  it("returns cached logo lists when available", async () => {
    const cached = [{ make: "tesla", filename: "logo.svg", url: "/logo" }];
    redisGet.mockResolvedValueOnce(cached);

    const result = await getAllCarLogos();

    expect(result).toEqual({ logos: cached });
    expect(listLogosMock).not.toHaveBeenCalled();
  });

  it("returns an error when blob access fails", async () => {
    redisGet.mockResolvedValueOnce(undefined);
    listLogosMock.mockRejectedValueOnce(new Error("blob error"));

    const result = await getAllCarLogos();

    expect(result).toEqual({ error: "blob error" });
  });

  it("should return undefined when getCarLogo throws an error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    redisGet.mockRejectedValueOnce(new Error("Redis connection failed"));

    const logo = await getCarLogo("Tesla");

    expect(logo).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching logo:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("should fetch from blob storage and cache when cache misses for getAllCarLogos", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const logos = [
      { make: "toyota", filename: "toyota.svg", url: "/blob/toyota.svg" },
      { make: "honda", filename: "honda.svg", url: "/blob/honda.svg" },
    ];
    redisGet.mockResolvedValueOnce(undefined);
    listLogosMock.mockResolvedValueOnce(logos);
    redisSet.mockResolvedValueOnce(undefined);

    const result = await getAllCarLogos();

    expect(result).toEqual({ logos });
    expect(listLogosMock).toHaveBeenCalled();
    expect(redisSet).toHaveBeenCalledWith("logos:all", JSON.stringify(logos));
    expect(consoleSpy).toHaveBeenCalledWith(
      "Cache miss, fetching from blob storage",
    );
    expect(consoleSpy).toHaveBeenCalledWith("Cached logos list");
    consoleSpy.mockRestore();
  });

  it("should return logo from blob storage without downloading when found", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const blobLogo = { make: "bmw", filename: "bmw.svg", url: "/blob/bmw.svg" };
    redisGet.mockResolvedValueOnce(undefined);
    getLogoMock.mockResolvedValueOnce(blobLogo);
    redisSet.mockResolvedValueOnce(undefined);

    const logo = await getCarLogo("BMW");

    expect(logo).toEqual(blobLogo);
    expect(downloadLogoMock).not.toHaveBeenCalled();
    expect(redisSet).toHaveBeenCalledWith("logo:bmw", JSON.stringify(blobLogo));
    consoleSpy.mockRestore();
  });

  it("should handle non-Error objects in getAllCarLogos catch block", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    redisGet.mockResolvedValueOnce(undefined);
    listLogosMock.mockRejectedValueOnce("string error");

    const result = await getAllCarLogos();

    expect(result).toEqual({ error: "Failed to fetch logos" });
    consoleSpy.mockRestore();
  });
});
