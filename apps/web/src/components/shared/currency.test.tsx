import { render, screen } from "@testing-library/react";
import { Currency } from "./currency";

describe("Currency", () => {
  it("should render a formatted value", () => {
    render(<Currency value={1000} />);
    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText("$1,000")).toBeVisible();
  });

  it("should render negative values with a leading minus", () => {
    render(<Currency value={-1000} />);
    expect(screen.getByText("-$1,000")).toBeVisible();
  });
});
