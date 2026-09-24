import { MonthSelector } from "@web/components/shared/month-selector";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { render } from "vitest-browser-react";

const wrapper = withNuqsTestingAdapter({
  searchParams: { month: "2024-01" },
});

vi.mock("@heroui/react", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const ComboBox = ({ children }: { children?: React.ReactNode }) => (
    <select aria-label="Month">{children}</select>
  );
  ComboBox.InputGroup = () => null;
  ComboBox.Popover = ({ children }: { children?: React.ReactNode }) => children;
  ComboBox.Trigger = () => null;

  const ListBox = ({ children }: { children?: React.ReactNode }) => children;
  ListBox.Section = ({ children }: { children?: React.ReactNode }) => children;
  ListBox.Item = ({
    children,
    textValue,
  }: {
    children?: React.ReactNode;
    textValue: string;
  }) => <option value={textValue}>{children}</option>;
  ListBox.ItemIndicator = () => null;

  return {
    ...actual,
    ComboBox,
    Header: () => null,
    Input: () => null,
    Label: () => null,
    ListBox,
    Separator: () => null,
    toast: { info: vi.fn() },
  };
});

vi.mock("@web/utils/formatting/format-date-to-month-year", () => ({
  formatDateToMonthYear: vi.fn(() => "January 2024"),
}));

vi.mock("@web/utils/group-by-year", () => ({
  groupByYear: vi.fn(() => ({ "2024": ["01"] })),
}));

describe("MonthSelector", () => {
  it("should render with months array", async () => {
    const mockMonths = ["2024-01"];
    const screen = await render(
      <MonthSelector months={mockMonths} latestMonth="2024-01" />,
      { wrapper },
    );
    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render with empty months array", async () => {
    const screen = await render(<MonthSelector months={[]} latestMonth="" />, {
      wrapper,
    });
    await expect.element(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render with wasAdjusted prop", async () => {
    const mockMonths = ["2024-01"];
    const screen = await render(
      <MonthSelector
        months={mockMonths}
        latestMonth="2024-01"
        wasAdjusted={true}
      />,
      { wrapper },
    );
    await expect.element(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
