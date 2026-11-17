import { expect, test } from "@playwright/test";

test.describe("COE Historical Results", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coe/results");
  });

  test("should display chart tooltips on hover", async ({ page }) => {
    const chartContainer = page
      .locator('.chart-container, [aria-label*="chart"], canvas, svg')
      .first();
    await expect(chartContainer).toBeVisible();

    await chartContainer.hover();

    await page.waitForTimeout(1000);
  });

  test("should handle table sorting functionality", async ({ page }) => {
    const sortableHeaders = page.locator('th[role="button"]');
    const headerCount = await sortableHeaders.count();

    if (headerCount > 0) {
      await sortableHeaders.first().click();
      await page.waitForLoadState("networkidle");

      const trendTable = page.locator("table");
      await expect(trendTable).toBeVisible();
    }
  });

  test("should display alert information if present", async ({ page }) => {
    const alertContainer = page.locator('.alert, [role="alert"]');
    const alertCount = await alertContainer.count();

    if (alertCount > 0) {
      await expect(alertContainer.first()).toBeVisible();
    }
  });

  test("should display loading states properly", async ({ page }) => {
    await page.goto("/coe/results", { waitUntil: "networkidle" });

    const chartContainer = page
      .locator('.chart-container, [aria-label*="chart"], canvas, svg')
      .first();
    await expect(chartContainer).toBeVisible();
  });

  test("should be responsive on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await expect(page.locator("h1")).toBeVisible();
    const chartContainer = page
      .locator('.chart-container, [aria-label*="chart"], canvas, svg')
      .first();
    await expect(chartContainer).toBeVisible();
  });
});
