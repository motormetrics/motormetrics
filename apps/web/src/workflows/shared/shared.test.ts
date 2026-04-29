import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@motormetrics/ai", () => ({
  generateHeroImage: vi.fn(),
  updatePostHeroImage: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

const { MockFatalError, MockRetryableError, writerWrite, writerReleaseLock } =
  vi.hoisted(() => {
    class MockFatalError extends Error {
      name = "FatalError";
      constructor(message: string) {
        super(message);
      }
    }

    class MockRetryableError extends Error {
      name = "RetryableError";
      retryAfter?: string;
      constructor(message: string, options?: { retryAfter?: string }) {
        super(message);
        this.retryAfter = options?.retryAfter;
      }
    }

    const writerWrite = vi.fn().mockResolvedValue(undefined);
    const writerReleaseLock = vi.fn();

    return {
      MockFatalError,
      MockRetryableError,
      writerWrite,
      writerReleaseLock,
    };
  });

vi.mock("workflow", () => ({
  FatalError: MockFatalError,
  RetryableError: MockRetryableError,
  getWritable: vi.fn(() => ({
    getWriter: () => ({
      write: writerWrite,
      releaseLock: writerReleaseLock,
    }),
  })),
}));

import { generateHeroImage, updatePostHeroImage } from "@motormetrics/ai";
import {
  emitEvent,
  generatePostHero,
  handleAIError,
  revalidatePostsCache,
} from "@web/workflows/shared";
import { revalidateTag } from "next/cache";

describe("emitEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should write event with timestamp and release the writer lock", async () => {
    await emitEvent({ type: "step:start", step: "doThing" });

    expect(writerWrite).toHaveBeenCalledTimes(1);
    const event = writerWrite.mock.calls[0][0];
    expect(event).toMatchObject({ type: "step:start", step: "doThing" });
    expect(typeof event.timestamp).toBe("number");
    expect(writerReleaseLock).toHaveBeenCalledTimes(1);
  });

  it("should release the writer lock even when write fails", async () => {
    writerWrite.mockRejectedValueOnce(new Error("write failed"));

    await expect(
      emitEvent({ type: "step:start", step: "fail" }),
    ).rejects.toThrow("write failed");

    expect(writerReleaseLock).toHaveBeenCalledTimes(1);
  });
});

describe("revalidatePostsCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should revalidate posts cache tags", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await revalidatePostsCache();

    expect(revalidateTag).toHaveBeenCalledWith("posts:list", "max");
    expect(revalidateTag).toHaveBeenCalledWith("posts:recent", "max");
    expect(consoleSpy).toHaveBeenCalledWith(
      "[WORKFLOW] Posts cache invalidated",
    );

    consoleSpy.mockRestore();
  });
});

describe("generatePostHero", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should generate hero image and persist the URL to the post", async () => {
    vi.mocked(generateHeroImage).mockResolvedValueOnce({
      pathname: "hero.png",
      url: "https://blob.example/hero.png",
    });
    vi.mocked(updatePostHeroImage).mockResolvedValueOnce(undefined);

    const url = await generatePostHero({
      postId: "post-1",
      title: "January 2024 Car Registrations",
      excerpt: "Summary.",
      dataType: "cars",
    });

    expect(generateHeroImage).toHaveBeenCalledWith({
      title: "January 2024 Car Registrations",
      excerpt: "Summary.",
      dataType: "cars",
      slug: expect.any(String),
    });
    expect(updatePostHeroImage).toHaveBeenCalledWith(
      "post-1",
      "https://blob.example/hero.png",
    );
    expect(url).toBe("https://blob.example/hero.png");
  });

  it("should propagate errors from generateHeroImage", async () => {
    vi.mocked(generateHeroImage).mockRejectedValueOnce(
      new Error("gateway down"),
    );

    await expect(
      generatePostHero({
        postId: "post-1",
        title: "T",
        excerpt: "E",
        dataType: "coe",
      }),
    ).rejects.toThrow("gateway down");

    expect(updatePostHeroImage).not.toHaveBeenCalled();
  });

  it("should propagate errors from updatePostHeroImage", async () => {
    vi.mocked(generateHeroImage).mockResolvedValueOnce({
      pathname: "hero.png",
      url: "https://blob.example/hero.png",
    });
    vi.mocked(updatePostHeroImage).mockRejectedValueOnce(
      new Error("db write failed"),
    );

    await expect(
      generatePostHero({
        postId: "post-1",
        title: "T",
        excerpt: "E",
        dataType: "deregistrations",
      }),
    ).rejects.toThrow("db write failed");
  });
});

describe("handleAIError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw RetryableError for 429 rate limit", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = new Error("Request failed with status 429");

    expect(() => handleAIError(error)).toThrow(MockRetryableError);

    try {
      handleAIError(error);
    } catch (e) {
      expect(e).toBeInstanceOf(MockRetryableError);
      expect((e as InstanceType<typeof MockRetryableError>).message).toBe(
        "AI rate limited",
      );
      expect((e as InstanceType<typeof MockRetryableError>).retryAfter).toBe(
        "1m",
      );
    }

    consoleSpy.mockRestore();
  });

  it("should throw FatalError for 401 auth error", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = new Error("Request failed with status 401");

    expect(() => handleAIError(error)).toThrow(MockFatalError);

    try {
      handleAIError(error);
    } catch (e) {
      expect(e).toBeInstanceOf(MockFatalError);
      expect((e as InstanceType<typeof MockFatalError>).message).toBe(
        "AI authentication failed",
      );
    }

    consoleSpy.mockRestore();
  });

  it("should throw FatalError for 403 auth error", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = new Error("Request failed with status 403");

    expect(() => handleAIError(error)).toThrow(MockFatalError);

    try {
      handleAIError(error);
    } catch (e) {
      expect(e).toBeInstanceOf(MockFatalError);
      expect((e as InstanceType<typeof MockFatalError>).message).toBe(
        "AI authentication failed",
      );
    }

    consoleSpy.mockRestore();
  });

  it("should rethrow other errors unchanged", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const originalError = new Error("Some other error");

    expect(() => handleAIError(originalError)).toThrow(originalError);

    consoleSpy.mockRestore();
  });

  it("should handle non-Error objects", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    expect(() => handleAIError("string error")).toThrow("string error");
    expect(() => handleAIError("error with 429")).toThrow(MockRetryableError);

    consoleSpy.mockRestore();
  });
});
