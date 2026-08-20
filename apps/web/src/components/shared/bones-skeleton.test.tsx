import { render } from "@testing-library/react";
import { BonesSkeleton } from "./bones-skeleton";

const singleBreakpoint = {
  name: "summary-card",
  width: 400,
  height: 120,
  bones: [
    [0, 0, 100, 120, 16, true],
    [8, 16, 24, 40, 8],
    [80, 16, 10, 40, "50%"],
  ],
};

const responsiveBones = {
  breakpoints: {
    375: {
      name: "summary-card",
      width: 375,
      height: 200,
      bones: [[0, 0, 100, 48, 8]],
    },
    768: {
      name: "summary-card",
      width: 768,
      height: 160,
      bones: [[0, 0, 50, 48, 8]],
    },
    1280: {
      name: "summary-card",
      width: 1280,
      height: 120,
      bones: [[0, 0, 33, 48, 8]],
    },
  },
};

describe("BonesSkeleton", () => {
  it("should render leaf and container bones from a single layout", () => {
    const { container } = render(<BonesSkeleton bones={singleBreakpoint} />);
    const bones = container.querySelectorAll("[aria-hidden] > div");

    expect(bones).toHaveLength(3);
    expect(bones[0]).toHaveClass("bg-surface");
    expect(bones[1]).toHaveClass("animate-pulse", "bg-default");
  });

  it("should accept object-form bones as well as compact tuples", () => {
    const { container } = render(
      <BonesSkeleton
        bones={{
          width: 200,
          height: 40,
          bones: [{ x: 0, y: 0, w: 50, h: 40, r: 8 }],
        }}
      />,
    );
    const bone = container.querySelector("[aria-hidden] > div");

    expect(bone).toHaveStyle({
      left: "0%",
      width: "50%",
      height: "40px",
      borderRadius: "8px",
    });
  });

  it("should size circular bones with matching width and height", () => {
    const { container } = render(<BonesSkeleton bones={singleBreakpoint} />);
    const circle = container.querySelectorAll("[aria-hidden] > div")[2];

    expect(circle).toHaveStyle({
      width: "40px",
      height: "40px",
      borderRadius: "50%",
    });
  });

  it("should emit a layout per breakpoint switched by CSS media queries", () => {
    const { container } = render(<BonesSkeleton bones={responsiveBones} />);
    const layers = container.querySelectorAll(
      ".summary-card-375, .summary-card-768, .summary-card-1280",
    );
    const css = container.querySelector("style")?.textContent ?? "";

    expect(layers).toHaveLength(3);
    expect(css).toContain(".summary-card-375{display:block}");
    expect(css).toContain(
      "@media (min-width:768px){.summary-card-375{display:none}}",
    );
    expect(css).toContain(
      "@media (min-width:768px){.summary-card-768{display:block}}",
    );
    expect(css).toContain(
      "@media (min-width:1280px){.summary-card-1280{display:block}}",
    );
  });

  it("should render nothing when a responsive map has no breakpoints", () => {
    const { container } = render(<BonesSkeleton bones={{ breakpoints: {} }} />);

    expect(container).toBeEmptyDOMElement();
  });
});
