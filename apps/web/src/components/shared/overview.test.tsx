import { BarRow } from "@web/components/shared/bar-row";
import { Headline, SectionHead } from "@web/components/shared/overview";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import { render } from "vitest-browser-react";

describe("SectionHead", () => {
  it("should render the eyebrow, heading, caption and link", async () => {
    const screen = await render(
      <SectionHead
        caption="2025 year to date"
        eyebrow="Registrations"
        link={{ href: "/cars/makes", label: "All makes" }}
        title="Top makes"
      />,
    );
    await expect.element(screen.getByText("Registrations")).toBeInTheDocument();
    await expect
      .element(screen.getByRole("heading", { level: 2 }))
      .toHaveTextContent("Top makes");
    await expect
      .element(screen.getByText("2025 year to date"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: "All makes" }))
      .toHaveAttribute("href", "/cars/makes");
  });
});

describe("Headline", () => {
  it("should render the label, figure, delta and caption", async () => {
    const screen = await render(
      <Headline
        caption="vs September"
        delta={<span>+5.2%</span>}
        label="New car registrations"
        value="6,100"
      />,
    );
    await expect
      .element(screen.getByText("New car registrations"))
      .toBeInTheDocument();
    await expect.element(screen.getByText("6,100")).toBeInTheDocument();
    await expect.element(screen.getByText("+5.2%")).toBeInTheDocument();
    await expect.element(screen.getByText("vs September")).toBeInTheDocument();
  });
});

describe("BarRow", () => {
  it("should size the fill to the share", async () => {
    const screen = await render(
      <BarRow label="Toyota" share={60.25} value="6,843" />,
    );
    await expect.element(screen.getByText("Toyota")).toBeInTheDocument();
    await expect
      .element(screen.getByRole("progressbar", { name: "Toyota" }))
      .toHaveAttribute("aria-valuenow", "60.25");
  });

  it("should clamp the share to the track", async () => {
    const screen = await render(<BarRow label="A" share={140} value="1" />);
    await expect
      .element(screen.getByRole("progressbar", { name: "A" }))
      .toHaveAttribute("aria-valuenow", "100");
  });
});

describe("SparklineChart", () => {
  it("should render nothing for a series too short to draw", async () => {
    const screen = await render(
      <SparklineChart
        data={[{ label: "Jan", value: 1 }]}
        name="Registrations"
        title="One point"
      />,
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it("should name the chart for assistive technology", async () => {
    const screen = await render(
      <SparklineChart
        data={[
          { label: "Jan", value: 3 },
          { label: "Feb", value: 5 },
          { label: "Mar", value: 4 },
        ]}
        name="Registrations"
        title="Registrations"
      />,
    );
    await expect
      .element(screen.getByRole("img", { name: "Registrations" }))
      .toBeInTheDocument();
  });
});
