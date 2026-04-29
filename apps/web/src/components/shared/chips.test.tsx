import { render } from "@testing-library/react";
import { NewChip } from "./chips";

describe("NewChip", () => {
  it("should render with default props", () => {
    const { container, getByText } = render(<NewChip />);
    expect(container).toMatchSnapshot();
    expect(getByText("New")).toBeInTheDocument();
  });
});
