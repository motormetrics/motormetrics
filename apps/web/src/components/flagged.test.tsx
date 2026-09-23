import { Flagged } from "@web/components/flagged";
import { render } from "vitest-browser-react";

describe("Flagged", () => {
  it("should render children when the flag is on", async () => {
    const ui = await Flagged({ enabled: true, children: <span>Shown</span> });

    const screen = await render(ui);

    await expect.element(screen.getByText("Shown")).toBeInTheDocument();
  });

  it("should render nothing when the flag is off", async () => {
    const ui = await Flagged({
      enabled: false,
      children: <span>Hidden</span>,
    });

    expect(ui).toBeNull();
  });
});
