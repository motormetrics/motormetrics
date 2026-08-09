import { beforeEach, describe, expect, it, vi } from "vitest";

const { embedMock, embeddingModelMock } = vi.hoisted(() => ({
  embedMock: vi.fn(),
  embeddingModelMock: vi.fn(),
}));

vi.mock("ai", () => ({
  embed: embedMock,
  gateway: {
    embeddingModel: embeddingModelMock,
  },
}));

import {
  formatDocumentForEmbedding,
  formatQueryForEmbedding,
  generateDocumentEmbedding,
  generateQueryEmbedding,
  POST_EMBEDDING_DIMENSIONS,
  POST_EMBEDDING_MODEL_ID,
} from "./embedding";

describe("Gemini 2 post embeddings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    embeddingModelMock.mockReturnValue("gateway-embedding-model");
    embedMock.mockResolvedValue({
      embedding: Array.from({ length: POST_EMBEDDING_DIMENSIONS }, () => 0.1),
    });
  });

  it("formats documents for asymmetric retrieval", () => {
    expect(
      formatDocumentForEmbedding({
        title: " EV registrations ",
        excerpt: " Monthly overview ",
        content: "Detailed results",
      }),
    ).toBe(
      "title: EV registrations | text: Monthly overview\n\nDetailed results",
    );
  });

  it("formats search queries with the Gemini 2 task instruction", () => {
    expect(formatQueryForEmbedding(" electric car trends ")).toBe(
      "task: search result | query: electric car trends",
    );
  });

  it("uses the Gateway Gemini 2 model with 768 dimensions for documents", async () => {
    await expect(
      generateDocumentEmbedding({
        title: "COE premiums",
        content: "Premium movement analysis",
      }),
    ).resolves.toHaveLength(POST_EMBEDDING_DIMENSIONS);

    expect(embeddingModelMock).toHaveBeenCalledWith(POST_EMBEDDING_MODEL_ID);
    expect(embedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gateway-embedding-model",
        value: "title: COE premiums | text: Premium movement analysis",
        providerOptions: {
          google: { outputDimensionality: POST_EMBEDDING_DIMENSIONS },
        },
      }),
    );
  });

  it("uses the query-specific telemetry path", async () => {
    await generateQueryEmbedding("hybrid registrations");

    expect(embedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        value: "task: search result | query: hybrid registrations",
        telemetry: expect.objectContaining({
          functionId: "post-query-embedding",
        }),
      }),
    );
  });

  it("rejects an unexpected vector size before database persistence", async () => {
    embedMock.mockResolvedValueOnce({ embedding: [0.1, 0.2, 0.3] });

    await expect(
      generateQueryEmbedding("hybrid registrations"),
    ).rejects.toThrow("Expected a 768-dimensional embedding, received 3");
  });
});
