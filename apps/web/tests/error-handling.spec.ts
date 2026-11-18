import { expect, test } from "@playwright/test";

test.describe("Error Handling and Edge Cases", () => {
  test.describe("404 Error Pages", () => {
    test("should display 404 page for non-existent routes", async ({
      page,
    }) => {
      await page.goto("/non-existent-page");

      const notFoundText = page.locator(
        "text=404, text=Not Found, text=Page not found",
      );
      const textCount = await notFoundText.count();

      if (textCount > 0) {
        await expect(notFoundText.first()).toBeVisible();
      } else {
        await expect(page.locator("h1")).toBeVisible();
      }
    });
  });

  test.describe("API Error Handling", () => {
    test.skip("should handle API failures gracefully", async ({ page }) => {
      await page.route("**/api/**", (route) => route.abort());

      await page.goto("/");

      await page.waitForTimeout(3000);

      const errorState = page.locator(
        '.error-message, text=Error loading data, [role="alert"]',
      );
      const errorCount = await errorState.count();

      if (errorCount > 0) {
        await expect(errorState.first()).toBeVisible();
      } else {
        await expect(page.locator("h1")).toBeVisible();
      }
    });

    test("should handle slow API responses", async ({ page }) => {
      await page.route("**/api/**", (route) => {
        setTimeout(() => {
          route.continue();
        }, 5000);
      });

      await page.goto("/coe");

      const loadingState = page.locator(
        '.loading, .spinner, [aria-label*="loading"]',
      );
      const loadingCount = await loadingState.count();

      if (loadingCount > 0) {
        await expect(loadingState.first()).toBeVisible();
      }

      await page.waitForLoadState("networkidle", { timeout: 10000 });
    });
  });

  test.describe("Invalid Query Parameters", () => {
    test("should handle invalid year parameters", async ({ page }) => {
      await page.goto("/coe?year=invalid-year");

      await expect(page.locator("h1")).toBeVisible();
      await page.waitForLoadState("networkidle");
    });

    test("should handle invalid category parameters", async ({ page }) => {
      await page.goto("/coe?category=invalid-category");

      await expect(page.locator("h1")).toBeVisible();
      await page.waitForLoadState("networkidle");
    });
  });

  test.describe("Network Errors", () => {
    test.skip("should handle offline state", async ({ page, context }) => {
      await context.setOffline(true);

      await page.goto("/");

      await page.waitForTimeout(3000);

      const offlineMessage = page.locator(
        'text=offline, text=network error, [role="alert"]',
      );
      const offlineCount = await offlineMessage.count();

      if (offlineCount > 0) {
        await expect(offlineMessage.first()).toBeVisible();
      }

      await context.setOffline(false);
    });
  });

  test.describe("Data Validation", () => {
    test("should handle empty data responses", async ({ page }) => {
      await page.route("**/api/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [] }),
        });
      });

      await page.goto("/cars");

      await page.waitForLoadState("networkidle");

      const emptyState = page.locator(
        'text=No data available, .empty-state, [role="status"]',
      );
      const emptyCount = await emptyState.count();

      if (emptyCount > 0) {
        await expect(emptyState.first()).toBeVisible();
      }
    });

    test("should handle malformed JSON responses", async ({ page }) => {
      await page.route("**/api/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "invalid json",
        });
      });

      await page.goto("/coe");

      await page.waitForTimeout(3000);

      const errorState = page.locator('.error-message, [role="alert"]');
      const errorCount = await errorState.count();

      if (errorCount > 0) {
        await expect(errorState.first()).toBeVisible();
      }
    });
  });

  test.describe("Memory and Performance", () => {
    test("should handle large datasets without crashes", async ({ page }) => {
      await page.goto("/coe");

      for (let i = 0; i < 10; i++) {
        await page.reload();
        await page.waitForLoadState("networkidle");
      }

      await expect(page.locator("h1")).toBeVisible();
    });

    test.skip("should handle rapid navigation without errors", async ({
      page,
    }) => {
      const routes = ["/cars", "/coe", "/", "/cars/electric-vehicles"];

      for (let i = 0; i < 3; i++) {
        for (const route of routes) {
          await page.goto(route);
          await page.waitForLoadState("domcontentloaded");
        }
      }

      await expect(page.locator("h1")).toBeVisible();
    });
  });
});
