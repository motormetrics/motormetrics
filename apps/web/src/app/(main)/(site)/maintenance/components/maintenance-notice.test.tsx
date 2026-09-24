import { MaintenanceNotice } from "@web/app/(main)/(site)/maintenance/components/maintenance-notice";
import { MotionGlobalConfig } from "motion/react";
import { render } from "vitest-browser-react";

describe("MaintenanceNotice", () => {
  beforeEach(() => {
    // The async render lets real animation frames run, so the icon's endless
    // rotation would stamp a time-dependent transform into the snapshot.
    // Freezing the frame loop keeps it at the initial render.
    MotionGlobalConfig.useManualTiming = true;
  });

  afterEach(() => {
    MotionGlobalConfig.useManualTiming = false;
  });

  it("should render the maintenance copy", async () => {
    const screen = await render(<MaintenanceNotice />);
    expect(screen.container).toMatchSnapshot();
    await expect
      .element(screen.getByText(/Pit Stop in Progress/i))
      .toBeInTheDocument();
  });
});
