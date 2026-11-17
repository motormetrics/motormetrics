import { PARFCalculator } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-calculator";
import { render } from "vitest-browser-react";

vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

describe("PARFCalculator", () => {
  it("should show the estimated rebate for the default ARF and age", async () => {
    const screen = await render(<PARFCalculator />);

    // $80,000 at 30%, under the $30,000 cap.
    await expect
      .element(screen.getByText("$24,000", { exact: true }).first())
      .toBeVisible();
    // $100,000 COE premium × 60 ÷ 120 months, plus the PARF rebate.
    await expect
      .element(screen.getByText("$74,000", { exact: true }).first())
      .toBeVisible();
    await expect
      .element(screen.getByText(/Estimates only, not financial advice/))
      .toBeVisible();
  });

  it("should use the age of a schedule row once it is selected", async () => {
    const screen = await render(<PARFCalculator />);

    await screen.getByRole("rowheader", { name: "Over 10 years" }).click();

    await expect
      .element(screen.getByRole("row", { name: /Over 10 years/ }))
      .toHaveAttribute("aria-selected", "true");
  });
});
