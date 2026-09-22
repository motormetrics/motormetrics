import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  gatewayMock,
  getGenerationInfoMock,
  generateTextMock,
  outputObjectMock,
  savePostMock,
} = vi.hoisted(() => ({
  gatewayMock: vi.fn(),
  getGenerationInfoMock: vi.fn(),
  generateTextMock: vi.fn(),
  outputObjectMock: vi.fn(),
  savePostMock: vi.fn(),
}));

vi.mock("ai", () => ({
  gateway: Object.assign(gatewayMock, {
    getGenerationInfo: getGenerationInfoMock,
  }),
  generateText: generateTextMock,
  Output: { object: outputObjectMock },
}));

vi.mock("./save-post", () => ({ savePost: savePostMock }));

import { generateBlogContent } from "./generate-post";
import { postSchema } from "./schemas";

describe("blog generation model configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gatewayMock.mockReturnValue("gateway-language-model");
    outputObjectMock.mockReturnValue("structured-output");
    getGenerationInfoMock.mockResolvedValue({ totalCost: 0.0042 });
    generateTextMock.mockResolvedValue({
      output: {
        title: "July registration trends",
        excerpt: "A monthly market summary.",
        lead: "Registrations fell to 4,007 in July.",
        sections: [
          {
            categories: ["cars"],
            heading: "Registrations fell",
            body: "4,007 cars were registered in July.",
            charts: [],
            highlights: [],
          },
        ],
        tags: ["Cars"],
      },
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      finalStep: {
        providerMetadata: {
          gateway: { generationId: "generation-1" },
        },
        response: {
          id: "response-1",
          modelId: "gemini-2.5-flash",
          timestamp: new Date("2026-08-08T00:00:00Z"),
        },
      },
      steps: [],
      finishReason: "stop",
      toolCalls: [],
    });
    savePostMock.mockResolvedValue({
      id: "post-1",
      title: "July registration trends",
      slug: "july-registration-trends",
    });
  });

  it("should generate structured output in one toolless call", async () => {
    await generateBlogContent({
      data: "make|count\nToyota|100",
      month: "2026-07",
      dataType: "cars",
    });

    expect(gatewayMock).toHaveBeenCalledWith("google/gemini-2.5-flash");
    expect(outputObjectMock).toHaveBeenCalledWith({ schema: postSchema });
    expect(generateTextMock).toHaveBeenCalledTimes(1);
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gateway-language-model",
        output: "structured-output",
        providerOptions: {
          google: {
            thinkingConfig: { thinkingBudget: 8192, includeThoughts: false },
          },
        },
        telemetry: expect.objectContaining({
          functionId: "post-generation/cars",
        }),
        runtimeContext: {
          month: "2026-07",
          dataType: "cars",
          tags: ["cars", "2026-07", "post-generation"],
        },
      }),
    );
    // Gemini refuses tools alongside a JSON response format, and there is
    // nothing left for a tool to do now figures are precomputed in SQL.
    const [request] = generateTextMock.mock.calls[0];
    expect(request).not.toHaveProperty("tools");
    expect(request).not.toHaveProperty("stopWhen");
  });

  it("should persist the Gateway model, usage, generation ID, and exact cost", async () => {
    await generateBlogContent({
      data: "category|premium\nA|100000",
      month: "2026-07",
      dataType: "coe",
    });

    expect(savePostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        responseMetadata: expect.objectContaining({
          generationId: "generation-1",
          responseId: "response-1",
          modelId: "gemini-2.5-flash",
          totalCost: 0.0042,
          usage: expect.objectContaining({
            inputTokens: 100,
            outputTokens: 50,
            totalTokens: 150,
          }),
        }),
      }),
    );
    expect(getGenerationInfoMock).toHaveBeenCalledWith({ id: "generation-1" });
  });

  it("should sum Gateway costs across every distinct step generation ID", async () => {
    getGenerationInfoMock
      .mockResolvedValueOnce({ totalCost: 0.001 })
      .mockResolvedValueOnce({ totalCost: 0.003 });
    generateTextMock.mockResolvedValueOnce({
      output: {
        title: "July registration trends",
        excerpt: "A monthly market summary.",
        lead: "Registrations fell to 4,007 in July.",
        sections: [
          {
            categories: ["cars"],
            heading: "Registrations fell",
            body: "4,007 cars were registered in July.",
            charts: [],
            highlights: [],
          },
        ],
        tags: ["Cars"],
      },
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      finalStep: {
        providerMetadata: {
          gateway: { generationId: "generation-final" },
        },
        response: {
          id: "response-1",
          modelId: "gemini-2.5-flash",
          timestamp: new Date("2026-08-08T00:00:00Z"),
        },
      },
      steps: [
        {
          providerMetadata: {
            gateway: { generationId: "generation-tool" },
          },
        },
        {
          providerMetadata: {
            gateway: { generationId: "generation-final" },
          },
        },
      ],
      finishReason: "stop",
      toolCalls: [],
    });

    await generateBlogContent({
      data: "make|count\nToyota|100",
      month: "2026-07",
      dataType: "cars",
    });

    // generation-final appears both as a step and at the top level, so it is
    // billed once, not twice.
    expect(getGenerationInfoMock).toHaveBeenCalledTimes(2);
    expect(getGenerationInfoMock).toHaveBeenCalledWith({
      id: "generation-tool",
    });
    expect(getGenerationInfoMock).toHaveBeenCalledWith({
      id: "generation-final",
    });
    expect(savePostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        responseMetadata: expect.objectContaining({
          generationId: "generation-final",
          totalCost: 0.004,
        }),
      }),
    );
  });

  it("should still save the post when Gateway cost lookup fails", async () => {
    getGenerationInfoMock.mockRejectedValueOnce(
      new Error("Report unavailable"),
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(
      generateBlogContent({
        data: "make|count\nToyota|100",
        month: "2026-07",
        dataType: "cars",
      }),
    ).resolves.toEqual(expect.objectContaining({ postId: "post-1" }));

    expect(savePostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        responseMetadata: expect.objectContaining({
          generationId: "generation-1",
          totalCost: undefined,
        }),
      }),
    );
    expect(consoleError).toHaveBeenCalledWith(
      "[GENERATE] Failed to retrieve Gateway generation cost:",
      "Report unavailable",
    );
    consoleError.mockRestore();
  });

  it("should omit totalCost when any multi-step Gateway cost lookup fails", async () => {
    getGenerationInfoMock
      .mockResolvedValueOnce({ totalCost: 0.001 })
      .mockRejectedValueOnce(new Error("Report unavailable"));
    generateTextMock.mockResolvedValueOnce({
      output: {
        title: "July registration trends",
        excerpt: "A monthly market summary.",
        lead: "Registrations fell to 4,007 in July.",
        sections: [
          {
            categories: ["cars"],
            heading: "Registrations fell",
            body: "4,007 cars were registered in July.",
            charts: [],
            highlights: [],
          },
        ],
        tags: ["Cars"],
      },
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      finalStep: {
        providerMetadata: {
          gateway: { generationId: "generation-final" },
        },
        response: {
          id: "response-1",
          modelId: "gemini-2.5-flash",
          timestamp: new Date("2026-08-08T00:00:00Z"),
        },
      },
      steps: [
        {
          providerMetadata: {
            gateway: { generationId: "generation-tool" },
          },
        },
        {
          providerMetadata: {
            gateway: { generationId: "generation-final" },
          },
        },
      ],
      finishReason: "stop",
      toolCalls: [],
    });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await generateBlogContent({
      data: "make|count\nToyota|100",
      month: "2026-07",
      dataType: "cars",
    });

    expect(savePostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        responseMetadata: expect.objectContaining({
          generationId: "generation-final",
          totalCost: undefined,
        }),
      }),
    );
    expect(consoleError).toHaveBeenCalledWith(
      "[GENERATE] Failed to retrieve Gateway generation cost:",
      "Report unavailable",
    );
    consoleError.mockRestore();
  });
});
