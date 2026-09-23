import { format } from "date-fns";
import { render } from "vitest-browser-react";
import { LastUpdated } from "./last-updated";

const mockLastUpdated = 1735660800; // 1 Jan 2025, 00:00:00 GMT+8
const mockFormattedDate = "01 Jan 2025, 12:00am";

// Mock date-fns format so tests aren't dependent on environment/timezone
vi.mock("date-fns", () => ({
  format: vi.fn(() => mockFormattedDate),
}));

describe("LastUpdated", () => {
  it("should render", async () => {
    const screen = await render(<LastUpdated lastUpdated={mockLastUpdated} />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render the separator and label", async () => {
    const screen = await render(<LastUpdated lastUpdated={mockLastUpdated} />);
    await expect.element(screen.getByText(/Last updated:/)).toBeVisible();
  });

  it("should display the mocked formatted date", async () => {
    const screen = await render(<LastUpdated lastUpdated={mockLastUpdated} />);
    // We expect our mock return value to appear in the DOM
    await expect.element(screen.getByText(mockFormattedDate)).toBeVisible();
  });

  it("should format date using date-fns with correct format string", async () => {
    await render(<LastUpdated lastUpdated={mockLastUpdated} />);
    // Verify date-fns format was called with the expected format string
    expect(format).toHaveBeenCalledWith(mockLastUpdated, "dd MMM yyyy, h:mma");
  });
});
