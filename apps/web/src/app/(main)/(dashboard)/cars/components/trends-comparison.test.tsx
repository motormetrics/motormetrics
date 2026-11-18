import { ComparisonTable } from "@web/app/(main)/(dashboard)/cars/components/comparison-table";
import { TrendsComparison } from "@web/app/(main)/(dashboard)/cars/components/trends-comparison";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

const mockMonths = ["2024-01", "2023-12", "2023-11"];

const mockComparisonData = {
  monthA: {
    month: "2024-01",
    total: 100,
    fuelType: [{ name: "Petrol", count: 60 }],
    vehicleType: [{ name: "Saloon", count: 80 }],
  },
  monthB: {
    month: "2023-12",
    total: 90,
    fuelType: [{ name: "Petrol", count: 50 }],
    vehicleType: [{ name: "Saloon", count: 70 }],
  },
};

describe("TrendsComparison", () => {
  it("should show the default months until two are picked", async () => {
    await render(
      <NuqsTestingAdapter>
        <TrendsComparison
          defaultMonthA="2024-01"
          defaultMonthB="2023-12"
          months={mockMonths}
        />
      </NuqsTestingAdapter>,
    );

    await expect
      .element(
        page.getByRole("combobox", { name: "Month to compare", exact: true }),
      )
      .toHaveValue("2024-01");
    await expect
      .element(page.getByRole("combobox", { name: "Month to compare against" }))
      .toHaveValue("2023-12");
  });

  it("should show the months named in the URL", async () => {
    await render(
      <NuqsTestingAdapter searchParams="?compareA=2023-12&compareB=2023-11">
        <TrendsComparison
          defaultMonthA="2024-01"
          defaultMonthB="2023-12"
          months={mockMonths}
        />
      </NuqsTestingAdapter>,
    );

    await expect
      .element(
        page.getByRole("combobox", { name: "Month to compare", exact: true }),
      )
      .toHaveValue("2023-12");
    await expect
      .element(page.getByRole("combobox", { name: "Month to compare against" }))
      .toHaveValue("2023-11");
  });

  it("should write the picked month to the URL", async () => {
    let query = "";
    await render(
      <NuqsTestingAdapter
        hasMemory
        onUrlUpdate={(event) => {
          query = event.queryString;
        }}
      >
        <TrendsComparison
          defaultMonthA="2024-01"
          defaultMonthB="2023-12"
          months={mockMonths}
        />
      </NuqsTestingAdapter>,
    );

    await page
      .getByRole("combobox", { name: "Month to compare against" })
      .selectOptions("2023-11");

    await expect.poll(() => query).toBe("?compareB=2023-11");
  });
});

describe("ComparisonTable", () => {
  it("should set the two months side by side with their change", async () => {
    const screen = await render(
      <ComparisonTable
        column="Fuel type"
        monthA={mockComparisonData.monthA}
        monthB={mockComparisonData.monthB}
        totalLabel="All fuel types"
        type="fuelType"
      />,
    );

    await expect
      .element(screen.getByRole("columnheader", { name: "Jan 2024" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("columnheader", { name: "Dec 2023" }))
      .toBeVisible();

    const petrol = screen.getByRole("row", { name: /Petrol/ });
    await expect.element(petrol.getByText("60")).toBeVisible();
    await expect.element(petrol.getByText("+20.0%")).toBeVisible();

    const total = screen.getByRole("row", { name: /All fuel types/ });
    await expect.element(total.getByText("100")).toBeVisible();
    await expect.element(total.getByText("+11.1%")).toBeVisible();
  });

  it("should show a dash where the second month has no figure", async () => {
    const screen = await render(
      <ComparisonTable
        column="Fuel type"
        monthA={mockComparisonData.monthA}
        monthB={{ ...mockComparisonData.monthB, fuelType: [] }}
        totalLabel="All fuel types"
        type="fuelType"
      />,
    );

    await expect
      .element(
        screen
          .getByRole("row", { name: /Petrol/ })
          .getByText("No comparable figure"),
      )
      .toBeInTheDocument();
  });
});
