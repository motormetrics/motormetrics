import { expect, test } from "@playwright/test";

test.describe("Public navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "motormetrics:notification-prompt-dismissed",
        "true",
      );
    });
    await page.goto("/");
  });

  test("navigates between the main public sections", async ({ page }) => {
    const mainNavigation = page.getByRole("navigation", {
      name: "Main navigation",
    });

    await mainNavigation.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL("/about");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Making Sense of Singapore's Car Market",
      }),
    ).toBeVisible();

    await mainNavigation.getByRole("link", { name: "Blog" }).click();
    await expect(page).toHaveURL("/blog");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Insights and Market Analysis",
      }),
    ).toBeVisible();

    await mainNavigation.getByRole("link", { name: "Learn" }).click();
    await expect(page).toHaveURL("/learn");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Your Guide to Singapore's Car Market",
      }),
    ).toBeVisible();
  });

  test("opens and closes the mobile menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const toggle = page.getByRole("button", {
      name: "Toggle navigation menu",
    });
    await toggle.click();
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
    await page.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL("/about");
  });

  test("supports keyboard focus in the main navigation", async ({ page }) => {
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });
});
