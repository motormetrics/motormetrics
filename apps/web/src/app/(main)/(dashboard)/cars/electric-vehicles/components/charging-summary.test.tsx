import { ChargingSummary } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/charging-summary";
import { render } from "vitest-browser-react";

vi.mock("@web/queries/ev-charging", () => ({
  getEvChargingNetworkSummary: async () => ({ connectors: 15_000 }),
  getEvChargingRegistrationsByMonth: async () => [
    { count: 10_000, month: "2024-06" },
    { count: 5_000, month: "2025-06" },
  ],
}));

describe("ChargingSummary", () => {
  it("should render the network growth as plain grey text", async () => {
    const screen = await render(await ChargingSummary());

    const growth = screen.getByText(/^\+50% on/);
    await expect.element(growth).toHaveClass("text-muted-strong");
    expect(screen.container.querySelector(".chip")).not.toBeInTheDocument();
  });

  it("should use HeroUI's large target bar with no track overrides", async () => {
    const screen = await render(await ChargingSummary());

    await expect
      .element(
        screen.getByRole("progressbar", {
          name: "Share of the 2030 target installed",
        }),
      )
      .toHaveClass("progress-bar--lg");
    expect(
      screen.container.querySelector(".progress-bar__track"),
    ).not.toHaveClass("rounded-full");
  });
});
