import { render } from "@testing-library/react";
import { BarRow } from "./bar-row";
import { Headline, SectionHead } from "./overview";
import { SparklineChart } from "./sparkline-chart";

describe("SectionHead", () => {
  it("should render the eyebrow, heading, caption and link", () => {
    const { getByRole, getByText } = render(
      <SectionHead
        caption="2025 year to date"
        eyebrow="Registrations"
        link={{ href: "/cars/makes", label: "All makes" }}
        title="Top makes"
      />,
    );
    expect(getByText("Registrations")).toBeInTheDocument();
    expect(getByRole("heading", { level: 2 })).toHaveTextContent("Top makes");
    expect(getByText("2025 year to date")).toBeInTheDocument();
    expect(getByRole("link", { name: "All makes" })).toHaveAttribute(
      "href",
      "/cars/makes",
    );
  });
});

describe("Headline", () => {
  it("should render the label, figure, delta and caption", () => {
    const { getByText } = render(
      <Headline
        caption="vs September"
        delta={<span>+5.2%</span>}
        label="New car registrations"
        value="6,100"
      />,
    );
    expect(getByText("New car registrations")).toBeInTheDocument();
    expect(getByText("6,100")).toBeInTheDocument();
    expect(getByText("+5.2%")).toBeInTheDocument();
    expect(getByText("vs September")).toBeInTheDocument();
  });
});

describe("BarRow", () => {
  it("should size the fill to the share", () => {
    const { container, getByText } = render(
      <BarRow label="Toyota" share={60.25} value="6,843" />,
    );
    expect(getByText("Toyota")).toBeInTheDocument();
    const fill = container.querySelector<HTMLElement>("span > span");
    expect(fill?.style.width).toBe("60.3%");
  });

  it("should clamp the share to the track", () => {
    const { container } = render(<BarRow label="A" share={140} value="1" />);
    const fill = container.querySelector<HTMLElement>("span > span");
    expect(fill?.style.width).toBe("100%");
  });
});

describe("SparklineChart", () => {
  it("should render nothing for a series too short to draw", () => {
    const { container } = render(
      <SparklineChart title="One point" values={[1]} />,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("should draw the line, the area and the latest-point marker", () => {
    const { container, getByRole } = render(
      <SparklineChart title="Registrations" values={[3, 5, 4, 6]} />,
    );
    expect(getByRole("img", { name: "Registrations" })).toBeInTheDocument();
    expect(container.querySelectorAll("path")).toHaveLength(2);
    expect(container.querySelector("circle")).toBeInTheDocument();
  });
});
