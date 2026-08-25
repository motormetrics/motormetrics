import { fireEvent, render, screen } from "@testing-library/react";
import { AdoptionColumns } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/adoption-columns";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setMonth = vi.fn();

vi.mock("nuqs", () => ({
  parseAsString: {
    withDefault: vi.fn(() => ({
      withOptions: vi.fn(() => ({})),
    })),
  },
  useQueryState: vi.fn(() => ["2025-10", setMonth]),
}));

const columns = [
  { month: "2025-08", share: 24.1 },
  { month: "2025-09", share: 28.4 },
  { month: "2025-10", share: 30.4 },
];

describe("AdoptionColumns", () => {
  beforeEach(() => {
    setMonth.mockClear();
  });

  it("should render one labelled column per month", () => {
    render(<AdoptionColumns columns={columns} selectedMonth="2025-10" />);

    expect(screen.getByRole("button", { name: "Show Aug 2025" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show Sep 2025" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show Oct 2025" })).toBeTruthy();
  });

  it("should mark only the selected month as pressed", () => {
    render(<AdoptionColumns columns={columns} selectedMonth="2025-09" />);

    expect(
      screen
        .getByRole("button", { name: "Show Sep 2025" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Show Oct 2025" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("should move the page to the month behind the column that was clicked", () => {
    render(<AdoptionColumns columns={columns} selectedMonth="2025-10" />);

    fireEvent.click(screen.getByRole("button", { name: "Show Aug 2025" }));

    expect(setMonth).toHaveBeenCalledWith("2025-08");
  });

  it("should scale every column against the tallest share", () => {
    const { container } = render(
      <AdoptionColumns columns={columns} selectedMonth="2025-10" />,
    );
    const bars = container.querySelectorAll<HTMLElement>("[data-column-bar]");

    expect(bars).toHaveLength(3);
    expect(bars[2]?.style.height).toBe("100%");
    expect(bars[0]?.style.height).toBe(`${(24.1 / 30.4) * 100}%`);
  });

  it("should not divide by zero when no month has any share", () => {
    const { container } = render(
      <AdoptionColumns
        columns={[{ month: "2025-10", share: 0 }]}
        selectedMonth="2025-10"
      />,
    );
    const bar = container.querySelector<HTMLElement>("[data-column-bar]");

    expect(bar?.style.height).toBe("0%");
  });
});
