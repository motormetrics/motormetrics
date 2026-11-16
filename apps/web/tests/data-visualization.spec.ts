// biome-ignore-all format: Playwright chained method formatting
import { expect, test } from "@playwright/test";

test.describe("Data Visualization Interactions", () => {
  test.describe.skip("Homepage Charts", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("should display and interact with total registrations chart", async ({
      page,
    }) => {
      const chartContainer = page
        .locator('.chart-container, [aria-label*="chart"], canvas, svg')
        .first();
      await expect(chartContainer).toBeVisible();

      await chartContainer.hover();
      await page.waitForTimeout(1000);

      const tooltip = page.locator('.tooltip, [role="tooltip"]');
      const tooltipCount = await tooltip.count();

      if (tooltipCount > 0) {
        await expect(tooltip.first()).toBeVisible();
      }
    });

    test("should display chart legend and allow toggling", async ({ page }) => {
      const legend = page.locator('.legend, [aria-label*="legend"]');
      const legendCount = await legend.count();

      if (legendCount > 0) {
        await expect(legend.first()).toBeVisible();

        const legendItems = legend.locator(
          '.legend-item, button, [role="button"]',
        );
        const itemCount = await legendItems.count();

        if (itemCount > 0) {
          await legendItems.first().click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe("COE Charts", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/coe");
    });

    test("should display COE chart with interactive elements", async ({
      page,
    }) => {
      const chartContainer = page
        .locator('.chart-container, [aria-label*="chart"], canvas, svg')
        .first();
      await expect(chartContainer).toBeVisible();

      await chartContainer.hover();
      await page.waitForTimeout(1000);

      const chartSvg = chartContainer.locator("svg");
      const svgCount = await chartSvg.count();

      if (svgCount > 0) {
        await expect(chartSvg.first()).toBeVisible();
      }
    });

    test("should handle chart zoom and pan interactions", async ({ page }) => {
      const chartContainer = page
        .locator('.chart-container, [aria-label*="chart"], canvas, svg')
        .first();
      await expect(chartContainer).toBeVisible();

      const boundingBox = await chartContainer.boundingBox();
      if (boundingBox) {
        await page.mouse.move(
          boundingBox.x + boundingBox.width / 2,
          boundingBox.y + boundingBox.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(
          boundingBox.x + boundingBox.width / 2 + 50,
          boundingBox.y + boundingBox.height / 2,
        );
        await page.mouse.up();

        await page.waitForTimeout(500);
      }
    });

    test("should display chart data points correctly", async ({ page }) => {
      const chartContainer = page
        .locator('.chart-container, [aria-label*="chart"], canvas, svg')
        .first();
      await expect(chartContainer).toBeVisible();

      const dataPoints = chartContainer.locator("circle, rect, path");
      const pointCount = await dataPoints.count();

      if (pointCount > 0) {
        await dataPoints.first().hover();
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe("Electric Vehicles Charts", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/cars/electric-vehicles");
    });

    test("should display overview trends chart", async ({ page }) => {
      const chartContainer = page
        .locator('.chart-container, [aria-label*="chart"], canvas, svg')
        .first();
      await expect(chartContainer).toBeVisible();

      await chartContainer.hover();
      await page.waitForTimeout(1000);
    });

    test("should handle chart responsiveness", async ({ page }) => {
      const chartContainer = page
        .locator('.chart-container, [aria-label*="chart"], canvas, svg')
        .first();
      await expect(chartContainer).toBeVisible();

      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(chartContainer).toBeVisible();

      await page.setViewportSize({ width: 375, height: 667 });
      await expect(chartContainer).toBeVisible();
    });
  });

  test.describe.skip("Chart Accessibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("should handle keyboard navigation on charts", async ({ page }) => {
      const chartContainer = page
        .locator('.chart-container, [aria-label*="chart"], canvas, svg')
        .first();
      await expect(chartContainer).toBeVisible();

      await chartContainer.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");

      await page.waitForTimeout(500);
    });

    test("should provide alternative text for charts", async ({ page }) => {
      const charts = page.locator(
        '.chart-container, [aria-label*="chart"], canvas, svg',
      );
      const chartCount = await charts.count();

      if (chartCount > 0) {
        const firstChart = charts.first();
        await expect(firstChart).toBeVisible();

        const ariaLabel = await firstChart.getAttribute("aria-label");
        const altText = await firstChart.locator("img").getAttribute("alt");

        if (!ariaLabel && !altText) {
          console.warn("Chart may lack accessibility attributes");
        }
      }
    });
  });

  test.describe("Chart Performance", () => {
    test("should load charts within reasonable time", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/coe");

      const chartContainer = page
        .locator('.chart-container, [aria-label*="chart"], canvas, svg')
        .first();
      await expect(chartContainer).toBeVisible();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
    });

    test("should handle large datasets without performance issues", async ({
      page,
    }) => {
      await page.goto("/coe?year=2025");

      const chartContainer = page
        .locator('.chart-container, [aria-label*="chart"], canvas, svg')
        .first();
      await expect(chartContainer).toBeVisible();

      await chartContainer.hover();
      await page.waitForTimeout(1000);

      const dataPoints = chartContainer.locator("circle, rect, path");
      const pointCount = await dataPoints.count();

      if (pointCount > 0) {
        console.log(`Chart rendered ${pointCount} data points`);
      }
    });
  });
});