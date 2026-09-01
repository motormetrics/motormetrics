import { GatewayError } from "@ai-sdk/gateway";
import { APICallError } from "ai";

/**
 * Whether the caller should retry the AI call.
 * - `retryable` — transient; retrying may succeed
 * - `fatal` — retrying cannot help (auth, permissions, unknown model)
 * - `unknown` — not an AI provider error; the caller should rethrow as-is
 */
export type AIErrorClassification = "retryable" | "fatal" | "unknown";

/** Why the call failed, for callers that surface a specific message. */
export type AIErrorReason =
  | "rate-limited"
  | "authentication"
  | "provider"
  | "unknown";

export interface ClassifiedAIError {
  classification: AIErrorClassification;
  reason: AIErrorReason;
  message: string;
}

/**
 * Classify an error thrown by a Gateway or provider call.
 *
 * The Gateway and the AI SDK derive `isRetryable` from the response status, so
 * prefer it over inspecting status codes here: the free-tier restriction
 * arrives as a GatewayInternalServerError with `statusCode: 403` and no code in
 * the message, while GatewayAuthenticationError carries no `statusCode` at all.
 *
 * The message checks are a fallback for providers that surface plain Errors.
 *
 * This deliberately returns a verdict rather than throwing: the workflow layer
 * owns the mapping onto WDK's FatalError / RetryableError, and this package
 * does not depend on `workflow`.
 */
export function classifyAIError(error: unknown): ClassifiedAIError {
  const message = error instanceof Error ? error.message : String(error);

  if (GatewayError.isInstance(error) || APICallError.isInstance(error)) {
    return {
      classification: error.isRetryable ? "retryable" : "fatal",
      reason: "provider",
      message,
    };
  }

  if (message.includes("429")) {
    return { classification: "retryable", reason: "rate-limited", message };
  }

  if (message.includes("401") || message.includes("403")) {
    return { classification: "fatal", reason: "authentication", message };
  }

  return { classification: "unknown", reason: "unknown", message };
}
