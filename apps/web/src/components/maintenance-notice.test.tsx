import { render, screen } from "@testing-library/react";
import { MaintenanceNotice } from "@web/components/maintenance-notice";
import { vi } from "vitest";

const mockUseMaintenance = vi.fn();

vi.mock("@web/hooks/use-maintenance", () => ({
  useMaintenance: () => mockUseMaintenance(),
}));

describe("MaintenanceNotice", () => {
  beforeEach(() => {
    mockUseMaintenance.mockClear();
  });

  it("should render the maintenance copy and run the hook", () => {
    render(<MaintenanceNotice />);
    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText(/Pit Stop in Progress/i)).toBeInTheDocument();
    expect(mockUseMaintenance).toHaveBeenCalled();
  });
});
