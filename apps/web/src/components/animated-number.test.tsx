import { render } from "@testing-library/react";
import { AnimatedNumber } from "./animated-number";

describe("AnimatedNumber", () => {
  it("should render with default props", () => {
    const { container } = render(<AnimatedNumber value={100} />);
    expect(container).toMatchSnapshot();
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render with custom from value", () => {
    const { container } = render(<AnimatedNumber value={100} from={50} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
