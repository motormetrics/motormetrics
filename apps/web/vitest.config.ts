import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    fsModuleCache: true,
    globals: true,
    // detectAsyncLeaks: true, // Available for targeted debugging; too noisy with framer-motion animation leaks
    coverage: {
      enabled: true,
      provider: "v8",
      include: ["src"],
      exclude: [
        "src/app/.well-known/**", // Generated Vercel Workflow routes
        // Exclude App Router surfaces from coverage, but keep route-level
        // error UI (error.tsx / global-error.tsx) measurable for Sonar new-code.
        // Parentheses are escaped so micromatch treats route groups literally.
        "src/app/\\(main\\)/**",
        "src/app/\\(social\\)/**",
        "src/app/admin/**",
        "src/app/api/**",
        "src/app/llms.txt/**",
        "src/app/layout.tsx",
        "src/app/not-found.tsx",
        "src/app/providers.tsx",
        "src/app/robots.ts",
        "src/app/sitemap.ts",
        "src/app/*.{css,ico,png}",
        "src/components/analytics.tsx",
        "src/config",
        "src/functions",
        // Exclude src/lib subdirectories except updater
        "src/lib/coe/**",
        "src/lib/metadata/**",
        "src/lib/og/**",
        "src/lib/realtime/**",
        "src/lib/social/**",
        "src/lib/workflows/**",
        "src/lib/*.ts", // Exclude loose files in src/lib
        "src/schema",
        "src/types",
        "src/app/(main)/(dashboard)/coe/pqp/components/unreleased-feature.tsx",
        "src/components/tables/**", // Tables not prioritized for coverage
        "src/components/notifications.tsx", // Realtime component
        "src/components/tables/columns/cars-make-columns.tsx",
        "src/utils/months.ts",
        "src/proxy.ts", // Next.js proxy middleware relies on Next internals
        "**/visitors",
        "src/queries/coe/**", // Low priority for coverage
        "src/queries/posts/**", // Blog queries not prioritized for coverage
        "src/workflows/car-population", // Workflow without tests yet
        "src/workflows/monthly-update", // Workflow without tests yet
        "src/workflows/monthly-update/**", // Workflow without tests yet
        "src/workflows/car-population/**", // Workflow without tests yet
        "src/workflows/shared/types.ts", // Pure type definitions

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
        "src/app/(main)/(site)/maintenance/actions/maintenance.ts",

        // Presentational components (UI-only, no business logic)
        "src/components/loading-indicator.tsx",
        "src/components/registration-trend.tsx",
        "src/components/top-makes-chart.tsx",
        "src/components/shared/skeleton.tsx",

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
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        extends: true,
        // Pre-bundle dependencies Vite would otherwise discover mid-run; the
        // resulting reload breaks vi.mock factories on a cold cache.
        optimizeDeps: {
          include: [
            "@heroui-pro/react/bar-chart",
            "@heroui-pro/react/kpi",
            "@neondatabase/serverless",
            "@upstash/redis/cloudflare",
            "date-fns",
            "motion/react",
            "next/cache",
            "next/image",
            "nuqs/server",
          ],
        },
        test: {
          name: "browser",
          include: ["src/**/*.test.tsx"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
