import { expect, test } from "@playwright/test";

test.describe("Homepage dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "motormetrics:notification-prompt-dismissed",
        "true",
      );
    });
    await page.goto("/");
  });

  test("presents the market overview in a clear hierarchy", async ({
    page,
  }) => {
    await expect(page).toHaveTitle(/MotorMetrics/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Overview" }),
    ).toBeVisible();
    await expect(page.getByText(/Total Registrations/)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Latest COE Results" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recent Posts" }),
    ).toBeVisible();
  });

  test("exposes accessible labels for icon-only destination links", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: "View car registration overview" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View all COE results" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View all blog posts" }),
    ).toBeVisible();
  });

  test("does not overflow the mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(
      page.getByRole("heading", { level: 1, name: "Overview", exact: true }),
    ).toBeVisible();

    const hasPageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasPageOverflow).toBe(false);

    await expect(
      page.getByRole("navigation", { name: "Dashboard navigation" }),
    ).toBeVisible();
  });
});

test("notification prompt is delayed, dismissible, and remembered", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem(
      "motormetrics:notification-prompt-dismissed",
    );
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: {
        permission: "default",
        requestPermission: async () => "default",
      },
    });
  });
  await page.goto("/");
  await expect(page.getByText("Get data update alerts")).toBeVisible({
    timeout: 5_000,
  });
  await page.getByRole("button", { name: "Not now" }).click();
  await expect(page.getByText("Get data update alerts")).toBeHidden();

  const dismissal = await page.evaluate(() =>
    window.localStorage.getItem("motormetrics:notification-prompt-dismissed"),
  );
  expect(dismissal).toBe("true");
});
