import { slugify } from "@motormetrics/utils";
import { expect, test } from "@playwright/test";

test.describe("Makes Page", () => {
  const carMakes = [
    { title: "BMW" },
    { title: "BYD" },
    { title: "MERCEDES BENZ" },
  ];

  carMakes.forEach(({ title }) => {
    const slug = slugify(title);

    test.describe(`${title} Make Page`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/cars/makes/${slug}`);
      });

      test(`should display ${title} page title and heading`, async ({
        page,
      }) => {
        await expect(page).toHaveTitle(new RegExp(title));
        await expect(page.locator("h1")).toContainText(title);
      });

      test(`should display ${title} overview trends chart`, async ({
        page,
      }) => {
        const chartContainer = page
          .locator('.chart-container, [aria-label*="chart"], canvas, svg')
          .first();
        await expect(chartContainer).toBeVisible();
      });

      test(`should handle query parameters for ${title} page`, async ({
        page,
      }) => {
        await page.goto(`/cars/makes/${slug}?month=2025-01`);

        await expect(page.locator("h1")).toContainText(title);
        await page.waitForLoadState("networkidle");
      });

      test(`should handle chart interactions for ${title}`, async ({
        page,
      }) => {
        const chartContainer = page
          .locator('.chart-container, [aria-label*="chart"], canvas, svg')
          .first();
        await expect(chartContainer).toBeVisible();

        await chartContainer.hover();
        await page.waitForTimeout(1000);
      });
    });
  });

  test("should navigate between car make pages", async ({ page }) => {
    const firstMake = carMakes[0];
    const _secondMake = carMakes[1];

    await page.goto(`/cars/makes/${slugify(firstMake.title)}`);
    await expect(page.locator("h1")).toContainText(firstMake.title);

    const makeLinks = page.locator('a[href*="/cars/makes/"]');
    const linkCount = await makeLinks.count();

    if (linkCount > 0) {
      await makeLinks.first().click();
      await page.waitForLoadState("networkidle");

      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("should handle empty data states for car makes", async ({ page }) => {
    await page.goto(`/cars/makes/${slugify(carMakes[0].title)}?month=1900-01`);

    await expect(page.locator("h1")).toContainText(carMakes[0].title);
    await page.waitForLoadState("networkidle");
  });
});
