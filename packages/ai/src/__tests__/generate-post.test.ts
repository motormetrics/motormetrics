import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateBlogContent, regenerateBlogContent } from "../generate-post";
import type { GeneratedPost } from "../schemas";

const { gateway, getGenerationInfo, generateText, savePost } = vi.hoisted(
  () => ({
    gateway: vi.fn(),
    getGenerationInfo: vi.fn(),
    generateText: vi.fn(),
    savePost: vi.fn(),
  }),
);
vi.mock("ai", () => ({
  gateway: Object.assign(gateway, { getGenerationInfo }),
  generateText,
  Output: { object: vi.fn() },
}));
vi.mock("../save-post", () => ({ savePost }));

const output: GeneratedPost = {
  title: "Registrations rose",
  excerpt: "More cars arrived.",
  lead: "A stronger month.",
  tags: ["Cars"],
  sections: [
    {
      categories: ["cars", "coe"],
      heading: "Registrations increased",
      body: "100 new cars arrived.",
      charts: [],
      highlights: [{ value: "100", label: "Cars", detail: "Registrations" }],
    },
  ],
};
const response = {
  id: "response-1",
  modelId: "model-1",
  timestamp: new Date("2026-10-04T00:00:00Z"),
};
const usage = { inputTokens: 100, outputTokens: 50, totalTokens: 150 };
const options = {
  month: "2026-07",
  dataType: "cars",
  data: "total|100",
} as const;

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  generateText.mockResolvedValue({
    output,
    usage,
    finalStep: { response },
    finishReason: "stop",
  });
  savePost.mockResolvedValue({
    id: "post-1",
    title: output.title,
    slug: "original-slug",
  });
  getGenerationInfo.mockResolvedValue({ totalCost: 0.0042 });
});

afterEach(() => vi.restoreAllMocks());

describe("blog generation failure and metadata handling", () => {
  it.each([
    undefined,
    {},
    { gateway: {} },
    { gateway: { generationId: 123 } },
    { gateway: { generationId: "" } },
  ])("saves without cost when no valid Gateway ID is available", async (providerMetadata) => {
    generateText.mockResolvedValue({
      output,
      usage,
      finalStep: { response, providerMetadata },
      finishReason: "stop",
    });
    await generateBlogContent(options);
    expect(getGenerationInfo).not.toHaveBeenCalled();
    expect(savePost).toHaveBeenCalledWith(
      expect.objectContaining({
        responseMetadata: expect.objectContaining({ totalCost: undefined }),
      }),
    );
  });

  it("falls back to the last valid step ID when final metadata is absent", async () => {
    generateText.mockResolvedValue({
      output,
      usage,
      finalStep: { response },
      finishReason: "stop",
      steps: [
        {},
        { providerMetadata: { gateway: { generationId: 123 } } },
        { providerMetadata: { gateway: { generationId: "step-1" } } },
        { providerMetadata: { gateway: { generationId: "step-2" } } },
      ],
    });
    await generateBlogContent(options);
    expect(getGenerationInfo).toHaveBeenCalledTimes(2);
    expect(savePost).toHaveBeenCalledWith(
      expect.objectContaining({
        responseMetadata: expect.objectContaining({
          generationId: "step-2",
          totalCost: 0.0084,
        }),
      }),
    );
  });

  it("handles a non-Error cost lookup rejection without discarding the post", async () => {
    generateText.mockResolvedValue({
      output,
      usage,
      finalStep: {
        response,
        providerMetadata: { gateway: { generationId: "step-1" } },
      },
      finishReason: "stop",
    });
    getGenerationInfo.mockRejectedValue("Report unavailable");
    await expect(generateBlogContent(options)).resolves.toMatchObject({
      postId: "post-1",
    });
    expect(console.error).toHaveBeenCalledWith(
      "[GENERATE] Failed to retrieve Gateway generation cost:",
      "Report unavailable",
    );
  });

  it("propagates model failures without attempting to save", async () => {
    const error = new Error("Model unavailable");
    generateText.mockRejectedValue(error);
    await expect(generateBlogContent(options)).rejects.toBe(error);
    expect(savePost).not.toHaveBeenCalled();
  });

  it("propagates persistence failures", async () => {
    const error = new Error("Database unavailable");
    savePost.mockRejectedValue(error);
    await expect(generateBlogContent(options)).rejects.toBe(error);
  });

  it("regenerates through the same structured rendering and persistence flow", async () => {
    await expect(regenerateBlogContent(options)).resolves.toEqual({
      month: options.month,
      dataType: "cars",
      postId: "post-1",
      title: output.title,
      slug: "original-slug",
      excerpt: output.excerpt,
    });
    expect(generateText).toHaveBeenCalledTimes(1);
    expect(savePost).toHaveBeenCalledExactlyOnceWith({
      title: output.title,
      content:
        "A stronger month.\n\n## Registrations increased\n\n100 new cars arrived.",
      excerpt: output.excerpt,
      heroImage: null,
      tags: output.tags,
      highlights: output.sections[0].highlights,
      month: options.month,
      dataType: "cars",
      responseMetadata: {
        responseId: response.id,
        generationId: undefined,
        modelId: response.modelId,
        timestamp: response.timestamp,
        totalCost: undefined,
        usage,
        sections: output.sections,
        categories: ["cars", "coe"],
      },
    });
  });
});
