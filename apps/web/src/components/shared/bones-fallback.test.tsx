import { render } from "@testing-library/react";
import { BonesFallback } from "./bones-fallback";

describe("BonesFallback", () => {
  it("should render captured bones for a named public skeleton", () => {
    const { container } = render(<BonesFallback name="summary-card" />);
    const bones = container.querySelectorAll("[aria-hidden] > div");

    expect(bones.length).toBeGreaterThan(0);
    expect(container.firstElementChild).toHaveClass(
      "overflow-hidden",
      "rounded-2xl",
      "bg-surface",
    );
  });
});
