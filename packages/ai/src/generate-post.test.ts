import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  codeInterpreterMock,
  gatewayMock,
  getGenerationInfoMock,
  generateTextMock,
  isStepCountMock,
  outputObjectMock,
  savePostMock,
} = vi.hoisted(() => ({
  codeInterpreterMock: vi.fn(),
  gatewayMock: vi.fn(),
  getGenerationInfoMock: vi.fn(),
  generateTextMock: vi.fn(),
  isStepCountMock: vi.fn(),
  outputObjectMock: vi.fn(),
  savePostMock: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: {
    tools: {
      codeInterpreter: codeInterpreterMock,
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
    codeInterpreterMock.mockReturnValue("code-interpreter-tool");
    outputObjectMock.mockReturnValue("structured-output");
    isStepCountMock.mockReturnValue("step-limit");
    getGenerationInfoMock.mockResolvedValue({ totalCost: 0.0042 });
    generateTextMock.mockResolvedValue({
      output: {
        title: "July registration trends",
        excerpt: "A monthly market summary.",
        content: "## Market overview",
        tags: ["Cars"],
        highlights: [],
      },
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      finalStep: {
        providerMetadata: {
          gateway: { generationId: "generation-1" },
        },
        response: {
          id: "response-1",
          modelId: "gpt-5.6-luna",
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

  it("uses Luna through Gateway with max reasoning and Code Interpreter", async () => {
    await generateBlogContent({
      data: "make|count\nToyota|100",
      month: "2026-07",
      dataType: "cars",
    });

    expect(gatewayMock).toHaveBeenCalledWith("openai/gpt-5.6-luna");
    expect(codeInterpreterMock).toHaveBeenCalledWith({});
    expect(outputObjectMock).toHaveBeenCalledWith({ schema: postSchema });
    expect(isStepCountMock).toHaveBeenCalledWith(10);
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gateway-language-model",
        tools: { code_interpreter: "code-interpreter-tool" },
        output: "structured-output",
        stopWhen: "step-limit",
        providerOptions: {
          openai: { reasoningEffort: "max", reasoningSummary: null },
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
          modelId: "gpt-5.6-luna",
          totalCost: 0.0042,
          usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
        }),
      }),
    );
    expect(getGenerationInfoMock).toHaveBeenCalledWith({ id: "generation-1" });
  });

  it("sums Gateway costs across every distinct step generation ID", async () => {
    getGenerationInfoMock
      .mockResolvedValueOnce({ totalCost: 0.001 })
      .mockResolvedValueOnce({ totalCost: 0.003 });
    generateTextMock.mockResolvedValueOnce({
      output: {
        title: "July registration trends",
        excerpt: "A monthly market summary.",
        content: "## Market overview",
        tags: ["Cars"],
        highlights: [],
      },
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      finalStep: {
        providerMetadata: {
          gateway: { generationId: "generation-final" },
        },
        response: {
          id: "response-1",
          modelId: "gpt-5.6-luna",
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
        content: "## Market overview",
        tags: ["Cars"],
        highlights: [],
      },
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      finalStep: {
        providerMetadata: {
          gateway: { generationId: "generation-final" },
        },
        response: {
          id: "response-1",
          modelId: "gpt-5.6-luna",
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
