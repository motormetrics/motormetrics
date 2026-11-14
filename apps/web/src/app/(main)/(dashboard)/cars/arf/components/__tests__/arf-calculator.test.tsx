import { ARFCalculator } from "@web/app/(main)/(dashboard)/cars/arf/components/arf-calculator";
import { render } from "vitest-browser-react";

vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

describe("ARFCalculator", () => {
  it("should show the estimated ARF for the default OMV", async () => {
    const screen = await render(<ARFCalculator head={<h1>ARF</h1>} />);

    // $40,000 OMV: $20,000 at 100% plus $20,000 at 140%.
    await expect
      .element(screen.getByText("$48,000", { exact: true }).first())
      .toBeVisible();
    await expect.element(screen.getByText("120% of OMV")).toBeVisible();
  });

  it("should list every band of the schedule, reached or not", async () => {
    const screen = await render(<ARFCalculator head={<h1>ARF</h1>} />);

    await expect
      .element(screen.getByRole("rowheader", { name: "Above $80,000" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Not reached").first())
      .toBeInTheDocument();
  });
});
