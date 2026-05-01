import { render, screen } from "@testing-library/react";
import { MonthSelector } from "./month-selector";

vi.mock("nuqs", () => ({
  parseAsString: {
    withDefault: vi.fn(() => ({
      withOptions: vi.fn(() => ({})),
    })),
  },
  useQueryState: vi.fn(() => ["2024-01", vi.fn()]),
}));

vi.mock("@heroui/react", () => {
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
  it("should render with months array", () => {
    const mockMonths = ["2024-01"];
    render(<MonthSelector months={mockMonths} latestMonth="2024-01" />);
    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render with empty months array", () => {
    render(<MonthSelector months={[]} latestMonth="" />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render with wasAdjusted prop", () => {
    const mockMonths = ["2024-01"];
    render(
      <MonthSelector
        months={mockMonths}
        latestMonth="2024-01"
        wasAdjusted={true}
      />,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
