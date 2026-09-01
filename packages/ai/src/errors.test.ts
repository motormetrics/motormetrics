import {
  GatewayAuthenticationError,
  GatewayInternalServerError,
  GatewayRateLimitError,
} from "@ai-sdk/gateway";
import { describe, expect, it } from "vitest";
import { classifyAIError } from "./errors";

describe("classifyAIError", () => {
  it("should treat the free-tier restriction as fatal", () => {
    // Delivered as a 500-class error carrying a 403, with no code in the text.
    const error = new GatewayInternalServerError({
      message: "Free tier users do not have access to this model.",
      statusCode: 403,
    });

    expect(error.isRetryable).toBe(false);
    expect(classifyAIError(error)).toEqual({
      classification: "fatal",
      reason: "provider",
      message: "Free tier users do not have access to this model.",
    });
  });

  it("should treat a credential failure as fatal", () => {
    // Observed with an expired OIDC token, where statusCode came back
    // undefined; isRetryable is the reliable signal either way.
    const error = new GatewayAuthenticationError({});

    expect(error.isRetryable).toBe(false);
    expect(classifyAIError(error).classification).toBe("fatal");
  });

  it("should treat a rate limit as retryable", () => {
    const error = new GatewayRateLimitError({});

    expect(classifyAIError(error).classification).toBe("retryable");
  });

  it("should fall back to the message for a plain Error", () => {
    expect(
      classifyAIError(new Error("Request failed with status 429")),
    ).toEqual({
      classification: "retryable",
      reason: "rate-limited",
      message: "Request failed with status 429",
    });

    expect(
      classifyAIError(new Error("Request failed with status 403")).reason,
    ).toBe("authentication");
  });

  it("should report anything else as unknown", () => {
    expect(classifyAIError(new Error("Some other error"))).toEqual({
      classification: "unknown",
      reason: "unknown",
      message: "Some other error",
    });

    expect(classifyAIError("string error").classification).toBe("unknown");
  });
});
