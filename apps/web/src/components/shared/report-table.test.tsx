import {
  Count,
  DeltaText,
  ReportCell,
  ReportRow,
  ReportTable,
  ShareBar,
} from "@web/components/shared/report-table";
import { render } from "vitest-browser-react";

describe("ReportTable", () => {
  it("should render column headers and the rows passed in", async () => {
    const screen = await render(
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

    await expect.element(screen.getByRole("table")).toBeInTheDocument();
    await expect
      .element(screen.getByRole("columnheader", { name: "Make" }))
      .toHaveClass("text-left");
    await expect
      .element(screen.getByRole("columnheader", { name: "Registrations" }))
      .toHaveClass("text-right");
    await expect.element(screen.getByText("Toyota")).toBeInTheDocument();
  });

  it("should key an unlabelled column off its width", async () => {
    const screen = await render(
      <ReportTable columns={[{ label: "", width: "30%" }]}>
        <ReportRow>
          <ReportCell>Share</ReportCell>
        </ReportRow>
      </ReportTable>,
    );

    // The width is applied through a custom property and a `sm:` utility, so
    // the inline style only ever carries the variable.
    const header = screen.getByRole("columnheader").element() as HTMLElement;
    expect(header.style.getPropertyValue("--report-col-width")).toBe("30%");
  });
});

describe("ReportRow", () => {
  it("should tint the active row", async () => {
    const screen = await render(
      <table>
        <tbody>
          <ReportRow isActive>
            <ReportCell>Electric</ReportCell>
          </ReportRow>
        </tbody>
      </table>,
    );

    await expect
      .element(screen.getByRole("row"))
      .toHaveClass("bg-accent-soft-2");
  });

  it("should leave an inactive row untinted", async () => {
    const screen = await render(
      <table>
        <tbody>
          <ReportRow>
            <ReportCell>Petrol</ReportCell>
          </ReportRow>
        </tbody>
      </table>,
    );

    await expect
      .element(screen.getByRole("row"))
      .not.toHaveClass("bg-accent-soft-2");
  });
});

describe("ReportCell", () => {
  it("should merge alignment and caller class names", async () => {
    const screen = await render(
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

    const cell = screen.getByRole("cell");
    await expect.element(cell).toHaveClass("text-right");
    await expect.element(cell).toHaveClass("font-bold");
  });
});

describe("ShareBar", () => {
  it("should size the fill to the share", async () => {
    const screen = await render(<ShareBar share={42.35} />);

    const fill = screen.container.querySelector("span > span");
    expect(fill).toHaveStyle({ width: "42.4%" });
    expect(fill).toHaveClass("bg-chart-5");
  });

  it("should mark the leader and clamp an over-full share", async () => {
    const screen = await render(<ShareBar isLeader share={120} />);

    const fill = screen.container.querySelector("span > span");
    expect(fill).toHaveStyle({ width: "100.0%" });
    expect(fill).toHaveClass("bg-chart-1");
  });
});

describe("DeltaText", () => {
  it("should render a rise with a leading plus", async () => {
    const screen = await render(<DeltaText value={12.34} />);
    await expect
      .element(screen.getByText("+12.3%"))
      .toHaveClass("text-success-soft-foreground");
  });

  it("should render a fall with a leading minus", async () => {
    const screen = await render(<DeltaText value={-4.5} />);
    await expect
      .element(screen.getByText("−4.5%"))
      .toHaveClass("text-warning-soft-foreground");
  });

  it("should treat zero as a rise", async () => {
    const screen = await render(<DeltaText value={0} />);
    await expect.element(screen.getByText("+0.0%")).toBeInTheDocument();
  });

  it("should render percentage-point movements", async () => {
    const screen = await render(<DeltaText unit="pp" value={2} />);
    await expect.element(screen.getByText("+2.0pp")).toBeInTheDocument();
  });
});

describe("Count", () => {
  it("should group a registration count", async () => {
    const screen = await render(<Count value={12345} />);
    await expect.element(screen.getByText("12,345")).toBeInTheDocument();
  });
});
