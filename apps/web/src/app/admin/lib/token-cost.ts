import type { LanguageModelUsage } from "@motormetrics/ai";

// Gemini 2.5 Flash pricing (USD per million tokens)
const PRICING = {
  input: 0.15,
  output: 0.6,
};

export function estimateTokenCost(usage: LanguageModelUsage): string {
  const inputCost = ((usage.inputTokens ?? 0) / 1_000_000) * PRICING.input;
  const outputCost = ((usage.outputTokens ?? 0) / 1_000_000) * PRICING.output;
  const total = inputCost + outputCost;
  return total < 0.01 ? `$${total.toFixed(4)}` : `$${total.toFixed(3)}`;
}
