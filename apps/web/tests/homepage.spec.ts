// biome-ignore-all format: Playwright chained method formatting
import { expect, test } from "@playwright/test";

test.describe.skip("Homepage/Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display page title and main heading", async ({ page }) => {
    await expect(page).toHaveTitle(/MotorMetrics/);
    await expect(page.locator("h1")).toContainText(
      "Singapore Cars Registration Trends",
    );
  });

  test("should display key statistics cards", async ({ page }) => {
    const statsCards = page
      .locator('.stats-card, .stat-card, [role="group"]')
      .filter({ hasText: "Total Cars Registered" });
    await expect(statsCards).toHaveCount(4);

    await expect(page.locator("text=Total Cars Registered")).toBeVisible();
    await expect(page.locator("text=This Month")).toBeVisible();
    await expect(page.locator("text=Last Month")).toBeVisible();
    await expect(page.locator("text=Year to Date")).toBeVisible();
  });

  test("should display total registrations chart", async ({ page }) => {
    await expect(page.locator("text=Total Registrations")).toBeVisible();

    const chartContainer = page
      .locator('.chart-container, [aria-label*="chart"], canvas, svg')
      .first();
    await expect(chartContainer).toBeVisible();
  });

  test("should display top 5 car makes section", async ({ page }) => {
    await expect(page.locator("text=Top 5 Makes")).toBeVisible();

    const topMakesSection = page
      .locator("section")
      .filter({ hasText: "Top 5 Makes" });
    await expect(topMakesSection).toBeVisible();
  });

  test("should navigate to cars page from navigation", async ({ page }) => {
    await page.click("text=Cars");
    await expect(page).toHaveURL("/cars");
  });

  test("should navigate to COE page from navigation", async ({ page }) => {
    await page.click("text=COE");
    await expect(page).toHaveURL("/coe");
  });

  test("should display loading states properly", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const statsCards = page
      .locator('.stats-card, .stat-card, [role="group"]')
      .filter({ hasText: "Total Cars Registered" });
    await expect(statsCards.first()).toBeVisible();
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('[data-testid="stats-card"]')).toBeVisible();
  });
});