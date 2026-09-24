import { MaintenancePoller } from "@web/app/(main)/(site)/maintenance/components/maintenance-poller";
import { render } from "vitest-browser-react";

const mockUseMaintenance = vi.fn();

vi.mock("@web/app/(main)/(site)/maintenance/hooks/use-maintenance", () => ({
  useMaintenance: () => mockUseMaintenance(),
}));

describe("MaintenancePoller", () => {
  it("should run the maintenance hook and render nothing", async () => {
    const screen = await render(<MaintenancePoller />);

    expect(mockUseMaintenance).toHaveBeenCalled();
    expect(screen.container.childElementCount).toBe(0);
  });
});
