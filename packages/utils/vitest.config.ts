import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    detectAsyncLeaks: true,
    coverage: {
      enabled: true,
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
    },
    exclude: ["dist/**", "node_modules/**"],
  },
});
