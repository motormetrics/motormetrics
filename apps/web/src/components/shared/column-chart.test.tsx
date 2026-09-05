import { fireEvent, render } from "@testing-library/react";
import { ColumnChart } from "./column-chart";

const columns = [
  { key: "2024-08", label: "Aug", value: 4460 },
  { key: "2024-09", label: "Sep", value: 4180 },
  {
    key: "2024-10",
    label: "Oct",
    tooltip: {
      rows: [{ label: "Premium", value: "$4,640" }],
      title: "Oct · Cat A",
    },
    value: 4640,
    valueLabel: "4,640",
  },
];

describe("ColumnChart", () => {
  it("should draw one column per point with the last highlighted", () => {
    const { getAllByRole } = render(<ColumnChart columns={columns} />);
    const buttons = getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(buttons[2]).toHaveTextContent("4,640");
  });

  it("should show the tooltip on hover", () => {
    const { getAllByRole, getByText, queryByText } = render(
      <ColumnChart columns={columns} />,
    );
    expect(queryByText("Oct · Cat A")).toBeNull();
    fireEvent.mouseEnter(getAllByRole("button")[2]);
    expect(getByText("Oct · Cat A")).toBeInTheDocument();
    expect(getByText("$4,640")).toBeInTheDocument();
  });

  it("should hand the key back on select", () => {
    const onSelect = vi.fn();
    const { getAllByRole } = render(
      <ColumnChart
        columns={columns}
        highlightKey="2024-09"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(getAllByRole("button")[0]);
    expect(onSelect).toHaveBeenCalledWith("2024-08");
    expect(getAllByRole("button")[1]).toHaveAttribute("aria-pressed", "true");
  });
});
