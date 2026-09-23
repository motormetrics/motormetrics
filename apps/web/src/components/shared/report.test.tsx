import { render } from "vitest-browser-react";
import {
  Report,
  ReportEyebrow,
  ReportFilterBar,
  ReportHeadline,
  ReportSection,
  ReportStat,
} from "./report";

describe("Report", () => {
  it("should render its children in the report column", async () => {
    const screen = await render(
      <Report>
        <p>Section</p>
      </Report>,
    );

    await expect.element(screen.getByText("Section")).toBeInTheDocument();
    expect(screen.container.querySelector(".gap-8")).toBeInTheDocument();
  });

  it("should merge a caller class name", async () => {
    const screen = await render(
      <Report className="pb-16">
        <p>Section</p>
      </Report>,
    );

    expect(screen.container.querySelector(".pb-16")).toBeInTheDocument();
  });
});

describe("ReportEyebrow", () => {
  it("should render its label", async () => {
    const screen = await render(<ReportEyebrow>Fuel type</ReportEyebrow>);
    await expect.element(screen.getByText("Fuel type")).toBeInTheDocument();
  });

  it("should merge a caller class name", async () => {
    const screen = await render(
      <ReportEyebrow className="text-accent">Fuel type</ReportEyebrow>,
    );
    await expect
      .element(screen.getByText("Fuel type"))
      .toHaveClass("text-accent");
  });
});

describe("ReportFilterBar", () => {
  it("should render the label and the controls passed in", async () => {
    const screen = await render(
      <ReportFilterBar label="Fuel type">
        <button type="button">Petrol</button>
      </ReportFilterBar>,
    );

    await expect.element(screen.getByText("Fuel type")).toBeInTheDocument();
    await expect.element(screen.getByText("Petrol")).toBeInTheDocument();
    await expect.element(screen.getByText("Range")).not.toBeInTheDocument();
  });

  it("should render a trailing control with its own label", async () => {
    const screen = await render(
      <ReportFilterBar
        className="mt-4"
        label="Fuel type"
        trailing={<button type="button">12 months</button>}
        trailingLabel="Range"
      >
        <button type="button">Petrol</button>
      </ReportFilterBar>,
    );

    await expect.element(screen.getByText("Range")).toBeInTheDocument();
    await expect.element(screen.getByText("12 months")).toBeInTheDocument();
  });

  it("should render a trailing control without a label", async () => {
    const screen = await render(
      <ReportFilterBar
        label="Fuel type"
        trailing={<button type="button">12 months</button>}
      >
        <button type="button">Petrol</button>
      </ReportFilterBar>,
    );

    await expect.element(screen.getByText("12 months")).toBeInTheDocument();
    await expect.element(screen.getByText("Range")).not.toBeInTheDocument();
  });
});

describe("ReportHeadline", () => {
  it("should render the label and figure alone", async () => {
    const screen = await render(
      <ReportHeadline label="Registrations" value="4,321" />,
    );

    await expect.element(screen.getByText("Registrations")).toBeInTheDocument();
    await expect.element(screen.getByText("4,321")).toBeInTheDocument();
    await expect
      .element(screen.getByText("vs last month"))
      .not.toBeInTheDocument();
  });

  it("should render the delta, sub-label and stat cells", async () => {
    const screen = await render(
      <ReportHeadline
        className="mb-4"
        delta={<span>+12.3%</span>}
        label="Registrations"
        stats={<ReportStat label="Share" value="18.4%" />}
        sub="vs last month"
        value="4,321"
      />,
    );

    await expect.element(screen.getByText("+12.3%")).toBeInTheDocument();
    await expect.element(screen.getByText("vs last month")).toBeInTheDocument();
    await expect.element(screen.getByText("Share")).toBeInTheDocument();
  });
});

describe("ReportStat", () => {
  it("should render a cell without a note", async () => {
    const screen = await render(<ReportStat label="Share" value="18.4%" />);

    await expect.element(screen.getByText("Share")).toBeInTheDocument();
    await expect.element(screen.getByText("18.4%")).toBeInTheDocument();
    await expect
      .element(screen.getByText("of all registrations"))
      .not.toBeInTheDocument();
  });

  it("should render a cell with a note", async () => {
    const screen = await render(
      <ReportStat label="Share" note="of all registrations" value="18.4%" />,
    );

    await expect
      .element(screen.getByText("of all registrations"))
      .toBeInTheDocument();
  });
});

describe("ReportSection", () => {
  it("should render a titled block without a caption", async () => {
    const screen = await render(
      <ReportSection title="By fuel type">
        <p>Table</p>
      </ReportSection>,
    );

    await expect
      .element(screen.getByRole("heading", { name: "By fuel type" }))
      .toBeInTheDocument();
    await expect.element(screen.getByText("Table")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Year to date"))
      .not.toBeInTheDocument();
  });

  it("should render a caption beside the title", async () => {
    const screen = await render(
      <ReportSection
        caption="Year to date"
        className="mt-8"
        title="By fuel type"
      >
        <p>Table</p>
      </ReportSection>,
    );

    await expect.element(screen.getByText("Year to date")).toBeInTheDocument();
  });
});
