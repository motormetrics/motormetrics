import { MaintenanceNotice } from "@web/components/maintenance-notice";
import { MotionGlobalConfig } from "motion/react";
import { vi } from "vitest";
import { render } from "vitest-browser-react";

const mockUseMaintenance = vi.fn();

vi.mock("@web/hooks/use-maintenance", () => ({
  useMaintenance: () => mockUseMaintenance(),
}));

describe("MaintenanceNotice", () => {
  beforeEach(() => {
    mockUseMaintenance.mockClear();
    // The async render lets real animation frames run, so the icon's endless
    // rotation would stamp a time-dependent transform into the snapshot.
    // Freezing the frame loop keeps it at the initial render.
    MotionGlobalConfig.useManualTiming = true;
  });

  afterEach(() => {
    MotionGlobalConfig.useManualTiming = false;
  });

  it("should render the maintenance copy and run the hook", async () => {
    const screen = await render(<MaintenanceNotice />);
    expect(screen.container).toMatchSnapshot();
    await expect
      .element(screen.getByText(/Pit Stop in Progress/i))
      .toBeInTheDocument();
    expect(mockUseMaintenance).toHaveBeenCalled();
  });
});
