import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadPostHeroImage } from "../blob";

const { put } = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock("@vercel/blob", () => ({ put }));

beforeEach(() => vi.resetAllMocks());

describe("uploadPostHeroImage", () => {
  it.each([
    [undefined, "png", "image/png"],
    ["image/jpeg", "jpeg", "image/jpeg"],
    ["image/webp", "webp", "image/webp"],
    ["unknown", "png", "unknown"],
  ])("uploads with content type %s", async (contentType, extension, expectedType) => {
    const body = Buffer.from("image bytes");
    const pathname = `posts/hero/monthly-update.${extension}`;
    put.mockResolvedValue({ url: "https://blob/hero", pathname });
    await expect(
      uploadPostHeroImage("monthly-update", body, contentType),
    ).resolves.toEqual({
      url: "https://blob/hero",
      pathname,
    });
    expect(put).toHaveBeenCalledExactlyOnceWith(pathname, body, {
      access: "public",
      contentType: expectedType,
      cacheControlMaxAge: 31536000,
      allowOverwrite: true,
    });
  });

  it("propagates storage failures", async () => {
    const error = new Error("Upload failed");
    put.mockRejectedValue(error);
    await expect(
      uploadPostHeroImage("monthly-update", Buffer.alloc(0)),
    ).rejects.toBe(error);
  });
});
