import { ChargingSummary } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/charging-summary";
import { render } from "vitest-browser-react";

vi.mock("@web/queries/ev-charging", () => ({
  getEvChargingLiveSummary: async () => ({
    connectors: 11_562,
    locations: 2_776,
    observedAt: "2026-10-01T17:40:00.000Z",
  }),
  getEvChargingNetworkSummary: async () => ({ connectors: 15_000 }),
  getEvChargingRegistrationsByMonth: async () => [
    { count: 10_000, month: "2024-06" },
    { count: 5_000, month: "2025-06" },
  ],
}));

describe("ChargingSummary", () => {
  it("should render the network growth as plain text, not a chip", async () => {
    const screen = await render(await ChargingSummary());

    await expect.element(screen.getByText("+50%")).toBeInTheDocument();
    expect(screen.container.querySelector(".chip")).not.toBeInTheDocument();
  });

  it("should stamp the live feed in Singapore time", async () => {
    const screen = await render(await ChargingSummary());

    await expect
      .element(
        screen.getByText(/^Live feed · as of 1:40 am SGT, 2 October 2026$/),
      )
      .toBeInTheDocument();
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
