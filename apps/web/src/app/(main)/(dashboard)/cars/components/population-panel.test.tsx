import { PopulationPanel } from "@web/app/(main)/(dashboard)/cars/components/population-panel";
import { render } from "vitest-browser-react";

const yearlyTotals = vi.hoisted(() => ({
  rows: [] as { total: number; year: string }[],
}));

vi.mock("@web/queries/vehicle-population", () => ({
  getVehiclePopulationByYearAndFuelType: async () => [
    { fuelType: "Petrol", total: 600_000, year: "2025" },
  ],
  getVehiclePopulationYearlyTotals: async () => yearlyTotals.rows,
}));

describe("PopulationPanel", () => {
  it("should render a fall as grey text with a true minus sign", async () => {
    yearlyTotals.rows = [
      { total: 950_000, year: "2025" },
      { total: 1_000_000, year: "2024" },
    ];
    const screen = await render(await PopulationPanel());

    const change = screen.getByText(/on 2024/);
    await expect.element(change).toHaveTextContent("−5% on 2024");
    await expect.element(change).toHaveClass("text-muted-strong");
    expect(screen.container.querySelector(".chip")).not.toBeInTheDocument();
  });

  it("should render a rise with a leading plus", async () => {
    yearlyTotals.rows = [
      { total: 1_025_000, year: "2025" },
      { total: 1_000_000, year: "2024" },
    ];
    const screen = await render(await PopulationPanel());

    await expect
      .element(screen.getByText(/on 2024/))
      .toHaveTextContent("+2.5% on 2024");
  });
});
