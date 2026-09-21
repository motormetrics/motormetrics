import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  codeExecutionMock,
  gatewayMock,
  getGenerationInfoMock,
  generateTextMock,
  isStepCountMock,
  outputObjectMock,
  savePostMock,
} = vi.hoisted(() => ({
  codeExecutionMock: vi.fn(),
  gatewayMock: vi.fn(),
  getGenerationInfoMock: vi.fn(),
  generateTextMock: vi.fn(),
  isStepCountMock: vi.fn(),
  outputObjectMock: vi.fn(),
  savePostMock: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: {
    tools: {
      codeExecution: codeExecutionMock,
    },
  },
}));

vi.mock("ai", () => ({
  gateway: Object.assign(gatewayMock, {
    getGenerationInfo: getGenerationInfoMock,
  }),
  generateText: generateTextMock,
  isStepCount: isStepCountMock,
  Output: { object: outputObjectMock },
}));

vi.mock("./save-post", () => ({ savePost: savePostMock }));

import { generateBlogContent } from "./generate-post";
import { postSchema } from "./schemas";

describe("blog generation model configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gatewayMock.mockReturnValue("gateway-language-model");
    codeExecutionMock.mockReturnValue("code-execution-tool");
    outputObjectMock.mockReturnValue("structured-output");
    isStepCountMock.mockReturnValue("step-limit");
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

  it("drafts with code execution then shapes into the schema", async () => {
    await generateBlogContent({
      data: "make|count\nToyota|100",
      month: "2026-07",
      dataType: "cars",
    });

    expect(gatewayMock).toHaveBeenCalledWith("google/gemini-2.5-flash");
    expect(codeExecutionMock).toHaveBeenCalledWith({});
    expect(outputObjectMock).toHaveBeenCalledWith({ schema: postSchema });
    expect(isStepCountMock).toHaveBeenCalledWith(10);
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gateway-language-model",
        tools: { code_execution: "code-execution-tool" },
        stopWhen: "step-limit",
        providerOptions: {
          google: {
            thinkingConfig: { thinkingBudget: 8192, includeThoughts: false },
          },
        },
        telemetry: expect.objectContaining({
          functionId: "post-generation/cars/draft",
        }),
        runtimeContext: {
          month: "2026-07",
          dataType: "cars",
          tags: ["cars", "2026-07", "post-generation"],
        },
      }),
    );
  });

  it("persists the Gateway model, usage, generation ID, and exact cost", async () => {
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
          // Summed across the draft and shaping calls, which the shared mock
          // answers identically — so this is the single-call figure doubled.
          usage: expect.objectContaining({
            inputTokens: 200,
            outputTokens: 100,
            totalTokens: 300,
          }),
        }),
      }),
    );
    expect(getGenerationInfoMock).toHaveBeenCalledWith({ id: "generation-1" });
  });

  it("sums Gateway costs across every distinct step generation ID", async () => {
    // Three IDs now: two from the draft call's steps, one from the shaping
    // call, since generation IDs are collected across both.
    getGenerationInfoMock
      .mockResolvedValueOnce({ totalCost: 0.001 })
      .mockResolvedValueOnce({ totalCost: 0.003 })
      .mockResolvedValueOnce({ totalCost: 0.002 });
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

    // Two distinct IDs from the draft call's steps, plus the shaping call's:
    // cost is summed across both calls, not just the one that emits the JSON.
    expect(getGenerationInfoMock).toHaveBeenCalledTimes(3);
    expect(getGenerationInfoMock).toHaveBeenCalledWith({
      id: "generation-tool",
    });
    expect(getGenerationInfoMock).toHaveBeenCalledWith({
      id: "generation-final",
    });
    expect(savePostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        responseMetadata: expect.objectContaining({
          // finalStep is the shaping call, so its generation ID is the one
          // recorded; the draft call's IDs still contribute to the cost.
          generationId: "generation-1",
          totalCost: 0.006,
        }),
      }),
    );
  });

  it("still saves the post when Gateway cost lookup fails", async () => {
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

  it("omits totalCost when any multi-step Gateway cost lookup fails", async () => {
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
          // finalStep is the shaping call, which falls through to the default
          // mock; the draft call's IDs are what the failing lookup covers.
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
});
