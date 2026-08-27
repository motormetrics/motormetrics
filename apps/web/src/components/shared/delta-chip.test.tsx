import { render } from "@testing-library/react";
import { DeltaChip } from "./delta-chip";

describe("DeltaChip", () => {
  it("should render a rise with a leading plus", () => {
    const { getByText } = render(<DeltaChip value={12.34} />);
    expect(getByText("+12.3%")).toBeInTheDocument();
  });

  it("should render a fall with a leading minus", () => {
    const { getByText } = render(<DeltaChip value={-4.5} />);
    expect(getByText("−4.5%")).toBeInTheDocument();
  });

  it("should treat zero as a rise", () => {
    const { getByText } = render(<DeltaChip value={0} />);
    expect(getByText("+0.0%")).toBeInTheDocument();
  });

  it("should render percentage-point movements", () => {
    const { getByText } = render(<DeltaChip unit="pp" value={2} />);
    expect(getByText("+2.0pp")).toBeInTheDocument();
  });

  it("should render the inverse tone", () => {
    const { container, getByText } = render(
      <DeltaChip tone="inverse" value={1.5} />,
    );
    expect(getByText("+1.5%")).toBeInTheDocument();
    expect(container.querySelector(".bg-ink-surface")).toBeInTheDocument();
  });

  it("should render the on-dark tone", () => {
    const { container, getByText } = render(
      <DeltaChip tone="on-dark" value={-1.5} />,
    );
    expect(getByText("−1.5%")).toBeInTheDocument();
    expect(container.querySelector(".text-accent-on-dark")).toBeInTheDocument();
  });
});
