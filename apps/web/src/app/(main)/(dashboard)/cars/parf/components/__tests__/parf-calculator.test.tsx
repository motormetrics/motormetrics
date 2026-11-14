import { PARFCalculator } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-calculator";
import { render } from "vitest-browser-react";

vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

describe("PARFCalculator", () => {
  it("should show the estimated rebate for the default ARF and age", async () => {
    const screen = await render(<PARFCalculator head={<h1>PARF</h1>} />);

    // $80,000 at 30%, under the $30,000 cap.
    await expect
      .element(screen.getByText("$24,000", { exact: true }).first())
      .toBeVisible();
    await expect
      .element(screen.getByText(/Estimates only, not financial advice/))
      .toBeVisible();
  });

  it("should use the age of a schedule row once it is selected", async () => {
    const screen = await render(<PARFCalculator head={<h1>PARF</h1>} />);

    await screen.getByRole("button", { name: "Use Over 10 years" }).click();

    await expect
      .element(screen.getByRole("button", { name: "Use Over 10 years" }))
      .toHaveAttribute("aria-pressed", "true");
    await expect
      .element(
        screen.getByText(
          "No PARF rebate is given for vehicles over 10 years old, under either schedule.",
        ),
      )
      .toBeVisible();
  });
});
