import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BASE_URL } from "../../config";
import { downloadLogo } from "../scraper";

const { uploadLogo } = vi.hoisted(() => ({ uploadLogo: vi.fn() }));
vi.mock("../blob", () => ({ uploadLogo }));

const fetchMock = vi.fn<typeof fetch>();
const sourceUrl = `${BASE_URL}/mercedes-benz-logo.png`;

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("downloadLogo", () => {
  it("downloads and uploads a logo at the minimum accepted size", async () => {
    const buffer = new ArrayBuffer(100);
    fetchMock.mockResolvedValue(
      new Response(buffer, { headers: { "content-type": "image/png" } }),
    );
    uploadLogo.mockResolvedValue({
      url: "https://blob/logo.png",
      pathname: "logos/mercedes-benz.png",
    });

    await expect(downloadLogo("Mercedes Benz")).resolves.toEqual({
      success: true,
      make: "mercedes-benz",
      url: "https://blob/logo.png",
      pathname: "logos/mercedes-benz.png",
      sourceUrl,
    });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(sourceUrl);
    expect(uploadLogo).toHaveBeenCalledExactlyOnceWith(
      "mercedes-benz",
      buffer,
      "image/png",
    );
  });

  it.each([
    [404, true],
    [403, false],
    [500, false],
  ])("handles HTTP %s", async (status, notFound) => {
    fetchMock.mockResolvedValue(new Response(null, { status }));
    await expect(downloadLogo("Mercedes Benz")).resolves.toEqual({
      success: false,
      make: "mercedes-benz",
      sourceUrl,
      error: `Failed to fetch logo: ${status}`,
      notFound,
    });
    expect(uploadLogo).not.toHaveBeenCalled();
  });

  it.each([
    "text/html",
    "application/json",
    "",
  ])("treats a non-image response (%s) as missing", async (contentType) => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        headers: contentType ? { "content-type": contentType } : {},
      }),
    );
    await expect(downloadLogo("Mercedes Benz")).resolves.toEqual({
      success: false,
      make: "mercedes-benz",
      sourceUrl,
      error: `Source returned ${contentType || "no content type"}, not an image`,
      notFound: true,
    });
    expect(uploadLogo).not.toHaveBeenCalled();
  });

  it.each([0, 99])("rejects a corrupted image of %s bytes", async (size) => {
    fetchMock.mockResolvedValue(
      new Response(new ArrayBuffer(size), {
        headers: { "content-type": "image/png" },
      }),
    );
    await expect(downloadLogo("Mercedes Benz")).resolves.toEqual({
      success: false,
      make: "mercedes-benz",
      sourceUrl,
      error: "Downloaded image is too small, likely corrupted",
      notFound: false,
    });
    expect(uploadLogo).not.toHaveBeenCalled();
  });

  it.each([
    new Error("Network unavailable"),
    "unexpected failure",
  ])("reports fetch failures", async (error) => {
    fetchMock.mockRejectedValue(error);
    await expect(downloadLogo("Mercedes Benz")).resolves.toEqual({
      success: false,
      make: "mercedes-benz",
      sourceUrl,
      error: error instanceof Error ? error.message : "Unknown error",
      notFound: false,
    });
    expect(uploadLogo).not.toHaveBeenCalled();
  });

  it("reports body read failures without uploading", async () => {
    const response = new Response(new ArrayBuffer(100), {
      headers: { "content-type": "image/png" },
    });
    vi.spyOn(response, "arrayBuffer").mockRejectedValue(
      new Error("Body interrupted"),
    );
    fetchMock.mockResolvedValue(response);
    await expect(downloadLogo("Mercedes Benz")).resolves.toMatchObject({
      success: false,
      error: "Body interrupted",
      notFound: false,
    });
    expect(uploadLogo).not.toHaveBeenCalled();
  });

  it("reports upload failures as retryable", async () => {
    fetchMock.mockResolvedValue(
      new Response(new ArrayBuffer(100), {
        headers: { "content-type": "image/png" },
      }),
    );
    uploadLogo.mockRejectedValue(new Error("Blob unavailable"));
    await expect(downloadLogo("Mercedes Benz")).resolves.toEqual({
      success: false,
      make: "mercedes-benz",
      sourceUrl,
      error: "Blob unavailable",
      notFound: false,
    });
  });
});
