import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    detectAsyncLeaks: true,
    exclude: ["dist/**", "node_modules/**"],
  },
});
