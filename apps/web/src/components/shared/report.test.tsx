import { render } from "@testing-library/react";
import {
  Report,
  ReportEyebrow,
  ReportFilterBar,
  ReportHeadline,
  ReportSection,
  ReportStat,
} from "./report";

describe("Report", () => {
  it("should render its children in the report column", () => {
    const { container, getByText } = render(
      <Report>
        <p>Section</p>
      </Report>,
    );

    expect(getByText("Section")).toBeInTheDocument();
    expect(container.querySelector(".gap-8")).toBeInTheDocument();
  });

  it("should merge a caller class name", () => {
    const { container } = render(
      <Report className="pb-16">
        <p>Section</p>
      </Report>,
    );

    expect(container.querySelector(".pb-16")).toBeInTheDocument();
  });
});

describe("ReportEyebrow", () => {
  it("should render its label", () => {
    const { getByText } = render(<ReportEyebrow>Fuel type</ReportEyebrow>);
    expect(getByText("Fuel type")).toBeInTheDocument();
  });

  it("should merge a caller class name", () => {
    const { getByText } = render(
      <ReportEyebrow className="text-accent">Fuel type</ReportEyebrow>,
    );
    expect(getByText("Fuel type")).toHaveClass("text-accent");
  });
});

describe("ReportFilterBar", () => {
  it("should render the label and the controls passed in", () => {
    const { getByText, queryByText } = render(
      <ReportFilterBar label="Fuel type">
        <button type="button">Petrol</button>
      </ReportFilterBar>,
    );

    expect(getByText("Fuel type")).toBeInTheDocument();
    expect(getByText("Petrol")).toBeInTheDocument();
    expect(queryByText("Range")).not.toBeInTheDocument();
  });

  it("should render a trailing control with its own label", () => {
    const { getByText } = render(
      <ReportFilterBar
        className="mt-4"
        label="Fuel type"
        trailing={<button type="button">12 months</button>}
        trailingLabel="Range"
      >
        <button type="button">Petrol</button>
      </ReportFilterBar>,
    );

    expect(getByText("Range")).toBeInTheDocument();
    expect(getByText("12 months")).toBeInTheDocument();
  });

  it("should render a trailing control without a label", () => {
    const { getByText, queryByText } = render(
      <ReportFilterBar
        label="Fuel type"
        trailing={<button type="button">12 months</button>}
      >
        <button type="button">Petrol</button>
      </ReportFilterBar>,
    );

    expect(getByText("12 months")).toBeInTheDocument();
    expect(queryByText("Range")).not.toBeInTheDocument();
  });
});

describe("ReportHeadline", () => {
  it("should render the label and figure alone", () => {
    const { getByText, queryByText } = render(
      <ReportHeadline label="Registrations" value="4,321" />,
    );

    expect(getByText("Registrations")).toBeInTheDocument();
    expect(getByText("4,321")).toBeInTheDocument();
    expect(queryByText("vs last month")).not.toBeInTheDocument();
  });

  it("should render the delta, sub-label and stat cells", () => {
    const { getByText } = render(
      <ReportHeadline
        className="mb-4"
        delta={<span>+12.3%</span>}
        label="Registrations"
        stats={<ReportStat label="Share" value="18.4%" />}
        sub="vs last month"
        value="4,321"
      />,
    );

    expect(getByText("+12.3%")).toBeInTheDocument();
    expect(getByText("vs last month")).toBeInTheDocument();
    expect(getByText("Share")).toBeInTheDocument();
  });
});

describe("ReportStat", () => {
  it("should render a cell without a note", () => {
    const { getByText, queryByText } = render(
      <ReportStat label="Share" value="18.4%" />,
    );

    expect(getByText("Share")).toBeInTheDocument();
    expect(getByText("18.4%")).toBeInTheDocument();
    expect(queryByText("of all registrations")).not.toBeInTheDocument();
  });

  it("should render a cell with a note", () => {
    const { getByText } = render(
      <ReportStat label="Share" note="of all registrations" value="18.4%" />,
    );

    expect(getByText("of all registrations")).toBeInTheDocument();
  });
});

describe("ReportSection", () => {
  it("should render a titled block without a caption", () => {
    const { getByRole, getByText, queryByText } = render(
      <ReportSection title="By fuel type">
        <p>Table</p>
      </ReportSection>,
    );

    expect(getByRole("heading", { name: "By fuel type" })).toBeInTheDocument();
    expect(getByText("Table")).toBeInTheDocument();
    expect(queryByText("Year to date")).not.toBeInTheDocument();
  });

  it("should render a caption beside the title", () => {
    const { getByText } = render(
      <ReportSection
        caption="Year to date"
        className="mt-8"
        title="By fuel type"
      >
        <p>Table</p>
      </ReportSection>,
    );

    expect(getByText("Year to date")).toBeInTheDocument();
  });
});
