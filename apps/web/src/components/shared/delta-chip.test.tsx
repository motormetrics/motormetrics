import { render } from "vitest-browser-react";
import { DeltaChip } from "./delta-chip";

describe("DeltaChip", () => {
  it("should render a rise with a leading plus", async () => {
    const screen = await render(<DeltaChip value={12.34} />);
    await expect
      .element(screen.getByText("+12.3%", { exact: true }))
      .toBeInTheDocument();
  });

  it("should render a fall with a leading minus", async () => {
    const screen = await render(<DeltaChip value={-4.5} />);
    await expect
      .element(screen.getByText("−4.5%", { exact: true }))
      .toBeInTheDocument();
  });

  it("should treat zero as a rise", async () => {
    const screen = await render(<DeltaChip value={0} />);
    await expect
      .element(screen.getByText("+0.0%", { exact: true }))
      .toBeInTheDocument();
  });

  it("should render percentage-point movements", async () => {
    const screen = await render(<DeltaChip unit="pp" value={2} />);
    await expect
      .element(screen.getByText("+2.0pp", { exact: true }))
      .toBeInTheDocument();
  });

  it("should render the inverse tone", async () => {
    const screen = await render(<DeltaChip tone="inverse" value={1.5} />);
    await expect
      .element(screen.getByText("+1.5%", { exact: true }))
      .toBeInTheDocument();
    expect(
      screen.container.querySelector(".bg-ink-surface"),
    ).toBeInTheDocument();
  });

  it("should render the on-dark tone", async () => {
    const screen = await render(<DeltaChip tone="on-dark" value={-1.5} />);
    await expect
      .element(screen.getByText("−1.5%", { exact: true }))
      .toBeInTheDocument();
    expect(
      screen.container.querySelector(".text-accent-on-dark"),
    ).toBeInTheDocument();
  });
});
