import { PremiumDelta } from "@web/app/(main)/(dashboard)/coe/components/premium-delta";
import { render } from "vitest-browser-react";

describe("PremiumDelta", () => {
  it("should render a rise with a leading plus", async () => {
    const screen = await render(<PremiumDelta ratio={0.02} />);
    await expect
      .element(screen.getByText("+2.0%", { exact: true }))
      .toBeInTheDocument();
  });

  it("should render a fall with a true minus", async () => {
    const screen = await render(<PremiumDelta ratio={-0.053} />);
    await expect
      .element(screen.getByText("−5.3%", { exact: true }))
      .toBeInTheDocument();
  });

  it("should render a dash when there is nothing to compare to", async () => {
    const screen = await render(<PremiumDelta ratio={null} />);
    await expect
      .element(screen.getByText("—", { exact: true }))
      .toBeInTheDocument();
  });

  it("should render zero without a sign", async () => {
    const screen = await render(<PremiumDelta ratio={0} />);
    await expect
      .element(screen.getByText("0.0%", { exact: true }))
      .toBeInTheDocument();
  });

  it("should render as plain grey text without sentiment colour", async () => {
    for (const ratio of [0.1, -0.1]) {
      const screen = await render(<PremiumDelta ratio={ratio} />);
      const element = screen.container.querySelector("span");
      expect(element?.className).toContain("text-muted-strong");
      expect(element?.className).not.toMatch(/success|warning|danger/);
      expect(element?.querySelector("svg")).toBeNull();
    }
  });
});
