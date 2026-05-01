import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartWidget } from "./widget";

let mockReducedMotion = false;

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="motion-wrapper">{children}</div>
    ),
  },
  useReducedMotion: () => mockReducedMotion,
}));

describe("ChartWidget", () => {
  beforeEach(() => {
    mockReducedMotion = false;
  });

  it("should render title and children when not empty", () => {
    render(
      <ChartWidget title="Test Chart">
        <div>Chart content</div>
      </ChartWidget>,
    );

    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText("Test Chart")).toBeInTheDocument();
    expect(screen.getByText("Chart content")).toBeInTheDocument();
  });

  it("should render title and subtitle when provided", () => {
    render(
      <ChartWidget title="Test Chart" subtitle="Test subtitle">
        <div>Chart content</div>
      </ChartWidget>,
    );

    expect(screen.getByText("Test Chart")).toBeInTheDocument();
    expect(screen.getByText("Test subtitle")).toBeInTheDocument();
  });

  it("should render empty state when isEmpty is true", () => {
    render(
      <ChartWidget title="Test Chart" isEmpty={true}>
        <div>Chart content</div>
      </ChartWidget>,
    );

    expect(screen.getByText("No data available")).toBeInTheDocument();
    expect(screen.queryByText("Chart content")).not.toBeInTheDocument();
  });

  it("should render custom empty message", () => {
    render(
      <ChartWidget
        title="Test Chart"
        isEmpty={true}
        emptyMessage="Custom empty message"
      >
        <div>Chart content</div>
      </ChartWidget>,
    );

    expect(screen.getByText("Custom empty message")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    render(
      <ChartWidget title="Test Chart">
        <div>Chart content</div>
      </ChartWidget>,
    );

    expect(screen.getByText("Test Chart")).toBeInTheDocument();
    expect(screen.queryByText("Test subtitle")).not.toBeInTheDocument();
  });

  it("should render without motion wrapper when reduced motion is preferred", () => {
    mockReducedMotion = true;

    render(
      <ChartWidget title="Reduced Motion">
        <div>Chart content</div>
      </ChartWidget>,
    );

    expect(screen.queryByTestId("motion-wrapper")).not.toBeInTheDocument();
    expect(screen.getByText("Reduced Motion")).toBeInTheDocument();
  });

  it("should apply height and card variant classes for empty state", () => {
    render(
      <ChartWidget title="Styled Chart" isEmpty variant="hero" height="tall">
        <div>Chart content</div>
      </ChartWidget>,
    );

    expect(
      screen.getByText("Styled Chart").closest("[data-slot='card']"),
    ).toHaveClass("shadow-md");
    expect(screen.getByText("No data available").closest("div")).toHaveClass(
      "h-[400px]",
    );
  });
});
