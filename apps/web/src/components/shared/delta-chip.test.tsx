import { DeltaChip } from "@web/components/shared/delta-chip";
import { render } from "vitest-browser-react";

describe("DeltaChip", () => {
  it("should render a rise with a leading plus", async () => {
    const screen = await render(<DeltaChip value={12.34} />);
    await expect
      .element(screen.getByText("+12.3%", { exact: true }))
      .toBeInTheDocument();
  });

  it("should render a fall with a true minus sign", async () => {
    const screen = await render(<DeltaChip value={-4.5} />);
    await expect
      .element(screen.getByText("−4.5%", { exact: true }))
      .toBeInTheDocument();
    expect(screen.container.textContent).not.toContain("-");
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

  it("should render plain grey text with no colour", async () => {
    const screen = await render(<DeltaChip value={-1.5} />);
    const element = screen.container.firstElementChild;
    expect(element?.tagName).toBe("SPAN");
    expect(element).toHaveClass("text-muted-strong");
    expect(element?.className).not.toMatch(/success|warning|danger|accent/);
    expect(screen.container.querySelector(".chip")).not.toBeInTheDocument();
  });

  it("should merge a caller's className", async () => {
    const screen = await render(<DeltaChip className="text-sm" value={1} />);
    expect(screen.container.firstElementChild).toHaveClass("text-sm");
  });
});
