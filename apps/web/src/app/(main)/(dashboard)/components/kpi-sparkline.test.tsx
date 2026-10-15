import { KpiSparkline } from "@web/app/(main)/(dashboard)/components/kpi-sparkline";
import { render } from "vitest-browser-react";

describe("KpiSparkline", () => {
  it("should render nothing for a series too short to draw", async () => {
    const screen = await render(
      <KpiSparkline
        data={[{ label: "Jan", value: 1 }]}
        label="Registrations"
      />,
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it("should name the chart for assistive technology", async () => {
    const screen = await render(
      <KpiSparkline
        data={[
          { label: "Jan", value: 3 },
          { label: "Feb", value: 5 },
          { label: "Mar", value: 4 },
        ]}
        label="Registrations"
      />,
    );
    await expect
      .element(
        screen.getByRole("img", {
          name: "Registrations over the last 3 months",
        }),
      )
      .toBeInTheDocument();
  });
});
