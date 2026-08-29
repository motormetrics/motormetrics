import { render } from "@testing-library/react";
import {
  Count,
  DeltaText,
  ReportCell,
  ReportRow,
  ReportTable,
  ShareBar,
} from "./report-table";

describe("ReportTable", () => {
  it("should render column headers and the rows passed in", () => {
    const { getByRole, getByText } = render(
      <ReportTable
        columns={[
          { label: "Make", width: "40%" },
          { align: "end", label: "Registrations" },
        ]}
      >
        <ReportRow>
          <ReportCell>Toyota</ReportCell>
          <ReportCell align="end">1,234</ReportCell>
        </ReportRow>
      </ReportTable>,
    );

    expect(getByRole("table")).toBeInTheDocument();
    expect(getByRole("columnheader", { name: "Make" })).toHaveClass(
      "text-left",
    );
    expect(getByRole("columnheader", { name: "Registrations" })).toHaveClass(
      "text-right",
    );
    expect(getByText("Toyota")).toBeInTheDocument();
  });

  it("should key an unlabelled column off its width", () => {
    const { getByRole } = render(
      <ReportTable columns={[{ label: "", width: "30%" }]}>
        <ReportRow>
          <ReportCell>Share</ReportCell>
        </ReportRow>
      </ReportTable>,
    );

    expect(getByRole("columnheader")).toHaveStyle({ width: "30%" });
  });
});

describe("ReportRow", () => {
  it("should tint the active row", () => {
    const { getByRole } = render(
      <table>
        <tbody>
          <ReportRow isActive>
            <ReportCell>Electric</ReportCell>
          </ReportRow>
        </tbody>
      </table>,
    );

    expect(getByRole("row")).toHaveClass("bg-accent-soft-2");
  });

  it("should leave an inactive row untinted", () => {
    const { getByRole } = render(
      <table>
        <tbody>
          <ReportRow>
            <ReportCell>Petrol</ReportCell>
          </ReportRow>
        </tbody>
      </table>,
    );

    expect(getByRole("row")).not.toHaveClass("bg-accent-soft-2");
  });
});

describe("ReportCell", () => {
  it("should merge alignment and caller class names", () => {
    const { getByRole } = render(
      <table>
        <tbody>
          <tr>
            <ReportCell align="end" className="font-bold">
              1,234
            </ReportCell>
          </tr>
        </tbody>
      </table>,
    );

    const cell = getByRole("cell");
    expect(cell).toHaveClass("text-right");
    expect(cell).toHaveClass("font-bold");
  });
});

describe("ShareBar", () => {
  it("should size the fill to the share", () => {
    const { container } = render(<ShareBar share={42.35} />);

    const fill = container.querySelector("span > span");
    expect(fill).toHaveStyle({ width: "42.4%" });
    expect(fill).toHaveClass("bg-chart-5");
  });

  it("should mark the leader and clamp an over-full share", () => {
    const { container } = render(<ShareBar isLeader share={120} />);

    const fill = container.querySelector("span > span");
    expect(fill).toHaveStyle({ width: "100.0%" });
    expect(fill).toHaveClass("bg-chart-1");
  });
});

describe("DeltaText", () => {
  it("should render a rise with a leading plus", () => {
    const { getByText } = render(<DeltaText value={12.34} />);
    expect(getByText("+12.3%")).toHaveClass("text-success-soft-foreground");
  });

  it("should render a fall with a leading minus", () => {
    const { getByText } = render(<DeltaText value={-4.5} />);
    expect(getByText("−4.5%")).toHaveClass("text-warning-soft-foreground");
  });

  it("should treat zero as a rise", () => {
    const { getByText } = render(<DeltaText value={0} />);
    expect(getByText("+0.0%")).toBeInTheDocument();
  });

  it("should render percentage-point movements", () => {
    const { getByText } = render(<DeltaText unit="pp" value={2} />);
    expect(getByText("+2.0pp")).toBeInTheDocument();
  });
});

describe("Count", () => {
  it("should group a registration count", () => {
    const { getByText } = render(<Count value={12345} />);
    expect(getByText("12,345")).toBeInTheDocument();
  });
});
