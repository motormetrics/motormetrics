import { MonthMenu } from "@web/components/shared/month-menu";
import { render } from "vitest-browser-react";

vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

const MONTHS = ["2024-01", "2024-02", "2023-12"];

describe("MonthMenu", () => {
  it("should check the current month across the year sections", async () => {
    const screen = await render(
      <MonthMenu
        latestMonth="2024-02"
        month="2024-01"
        months={MONTHS}
        pathname="/cars"
      />,
    );

    await screen.getByRole("button", { name: "Month" }).click();

    await expect
      .element(screen.getByRole("menuitemradio", { name: "Jan 2024" }))
      .toHaveAttribute("aria-checked", "true");
    for (const label of ["Feb 2024", "Dec 2023"]) {
      await expect
        .element(screen.getByRole("menuitemradio", { name: label }))
        .toHaveAttribute("aria-checked", "false");
    }
  });

  it("should link each month and keep the other params", async () => {
    const screen = await render(
      <MonthMenu
        latestMonth="2024-02"
        month="2024-01"
        months={MONTHS}
        pathname="/cars/registrations"
        query={{ fuel: "Electric", month: "2024-01" }}
      />,
    );

    await screen.getByRole("button", { name: "Month" }).click();

    await expect
      .element(screen.getByRole("menuitemradio", { name: "Dec 2023" }))
      .toHaveAttribute(
        "href",
        "/cars/registrations?fuel=Electric&month=2023-12",
      );
    await expect
      .element(screen.getByRole("menuitemradio", { name: "Feb 2024" }))
      .toHaveAttribute("href", "/cars/registrations?fuel=Electric");
  });
});
