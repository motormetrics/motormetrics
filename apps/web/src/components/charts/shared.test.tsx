import { render, screen } from "@testing-library/react";
import {
  currencyTooltipFormatter,
  MonthXAxis,
  PriceYAxis,
} from "@web/components/charts/shared";
import { Line, LineChart } from "recharts";

describe("Chart shared helpers", () => {
  it("should format currency tooltip content with matching colour indicator", () => {
    const fragment = currencyTooltipFormatter({
      value: 123456,
      name: "COE Premium",
      index: 0,
    });

    render(<div>{fragment}</div>);
    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText("COE Premium")).toBeInTheDocument();
    expect(screen.getByText("$123,456")).toBeInTheDocument();
  });

  it("should render axis helpers without crashing", () => {
    render(
      <LineChart
        width={400}
        height={200}
        data={[{ month: "2024-01", price: 50000 }]}
      >
        <PriceYAxis />
        <MonthXAxis tickFormatter={(value) => value} />
        <Line dataKey="price" stroke="#000" />
      </LineChart>,
    );

    expect(document.querySelector("svg")).toBeTruthy();
  });
});
