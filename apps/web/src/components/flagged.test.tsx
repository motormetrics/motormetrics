import { render, screen } from "@testing-library/react";
import { Flagged } from "@web/components/flagged";

describe("Flagged", () => {
  it("should render children when the flag is on", async () => {
    const ui = await Flagged({ enabled: true, children: <span>Shown</span> });

    render(ui);

    expect(screen.getByText("Shown")).toBeInTheDocument();
  });

  it("should render nothing when the flag is off", async () => {
    const ui = await Flagged({
      enabled: false,
      children: <span>Hidden</span>,
    });

    expect(ui).toBeNull();
  });
});
