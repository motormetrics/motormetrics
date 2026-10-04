import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadLogo } from "../blob";

const { put } = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock("@vercel/blob", () => ({ put }));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("uploadLogo", () => {
  it.each([
    ["Mercedes Benz", "image/png", "mercedes-benz.png"],
    ["Toyota", "image/jpeg", "toyota.jpg"],
    ["BYD", "image/svg+xml", "byd.svg"],
    ["BMW", "image/webp", "bmw.webp"],
  ])("uploads %s with the correct filename", async (make, contentType, filename) => {
    const buffer = new ArrayBuffer(100);
    const pathname = `logos/${filename}`;
    const url = `https://blob/${pathname}`;
    put.mockResolvedValue({ url, pathname });

    await expect(uploadLogo(make, buffer, contentType)).resolves.toEqual({
      url,
      pathname,
      filename,
    });
    expect(put).toHaveBeenCalledExactlyOnceWith(pathname, buffer, {
      access: "public",
      contentType,
      allowOverwrite: true,
      cacheControlMaxAge: 31536000,
    });
  });

  it("returns the URL and pathname supplied by Blob", async () => {
    put.mockResolvedValue({
      url: "https://cdn/logo.png",
      pathname: "stored/logo.png",
    });
    await expect(
      uploadLogo("Toyota", new ArrayBuffer(100), "image/png"),
    ).resolves.toEqual({
      url: "https://cdn/logo.png",
      pathname: "stored/logo.png",
      filename: "toyota.png",
    });
  });

  it("propagates upload failures", async () => {
    const error = new Error("Blob unavailable");
    put.mockRejectedValue(error);
    await expect(
      uploadLogo("Toyota", new ArrayBuffer(100), "image/png"),
    ).rejects.toBe(error);
  });
});
