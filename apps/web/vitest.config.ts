import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    // detectAsyncLeaks: true, // Available for targeted debugging; too noisy with framer-motion animation leaks
    coverage: {
      enabled: true,
      include: ["src"],
      exclude: [
        "src/app",
        "src/components/analytics.tsx",
        "src/config",
        "src/functions",
        // Exclude src/lib subdirectories except updater
        "src/lib/cars/**",
        "src/lib/coe/**",
        "src/lib/data/**",
        "src/lib/metadata/**",
        "src/lib/og/**",
        "src/lib/realtime/**",
        "src/lib/social/**",
        "src/lib/workflows/**",
        "src/lib/*.ts", // Exclude loose files in src/lib
        "src/schema",
        "src/types",
        "src/components/unreleased-feature.tsx",
        "src/components/tables/**", // Tables not prioritized for coverage
        "src/components/notifications.tsx", // Realtime component
        "src/components/tables/columns/cars-make-columns.tsx",
        "src/utils/months.ts",
        "src/proxy.ts", // Next.js proxy middleware relies on Next internals
        "**/visitors",
        "src/queries/coe/**", // Low priority for coverage
        "src/queries/posts/**", // Blog queries not prioritized for coverage
        "src/queries/car-costs/**", // Low priority for coverage
        "src/workflows/car-costs", // Workflow without tests yet
        "src/workflows/car-costs/**", // Workflow without tests yet
        "src/workflows/car-population", // Workflow without tests yet
        "src/workflows/car-population/**", // Workflow without tests yet
        "src/workflows/shared/types.ts", // Pure type definitions
        "src/lib/updater/xlsx-updater.ts", // XLSX updater without tests
        "src/lib/updater/services/process-xlsx.ts", // XLSX processor without tests

        // Barrel files (pure re-exports, no logic)
        "src/components/coe/index.ts",
        "src/components/shared/index.ts",
        "src/queries/index.ts",
        "src/queries/cars/index.ts",
        "src/queries/cars/makes/index.ts",
        "src/queries/car-population/index.ts",
        "src/queries/deregistrations/index.ts",
        "src/queries/vehicle-population/index.ts",
        "src/lib/updater/index.ts",
        "src/lib/updater/services/index.ts",
        "src/utils/arrays/index.ts",
        "src/utils/dates/index.ts",
        "src/utils/formatting/index.ts",
        "src/utils/social/index.ts",

        // Infrastructure/setup files (external service integration)
        "src/instrumentation.ts",
        "src/actions/maintenance.ts",

        // Presentational components (UI-only, no business logic)
        "src/components/loading-indicator.tsx",
        "src/components/registration-trend.tsx",
        "src/components/top-makes-chart.tsx",
        "src/components/shared/skeleton.tsx",

        // EV queries (DB aggregation, no testable logic without DB)
        "src/queries/cars/electric-vehicles.ts",

        // Simple DB/API wrappers (no business logic)
        "src/queries/cars/latest-month.ts",
        "src/utils/social/linkedin.ts",
      ],
      reporter: ["text", "text-summary", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    exclude: [...configDefaults.exclude, "tests", "**/*.integration.test.ts"],
    setupFiles: "./setup-tests.ts",
  },
});
