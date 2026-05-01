import { toast } from "@heroui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { YearSelector } from "./year-selector";

const mockSetYear = vi.fn();
const mockUseQueryState = vi.fn(() => [2024, mockSetYear]);

vi.mock("nuqs", () => ({
  parseAsInteger: {
    withDefault: vi.fn(() => ({
      withOptions: vi.fn(() => ({})),
    })),
  },
  useQueryState: () => mockUseQueryState(),
}));

vi.mock("@heroui/react", () => {
  const ComboBox = ({
    selectedKey,
    onSelectionChange,
    children,
  }: {
    selectedKey?: string;
    onSelectionChange?: (key: string | null) => void;
    children?: React.ReactNode;
  }) => (
    <select
      aria-label="Year"
      data-testid="year-selector"
      value={selectedKey ?? ""}
      onChange={(event) => onSelectionChange?.(event.target.value || null)}
    >
      <option value="">None</option>
      {children}
    </select>
  );
  ComboBox.InputGroup = () => null;
  ComboBox.Popover = ({ children }: { children?: React.ReactNode }) => children;
  ComboBox.Trigger = () => null;

  const ListBox = ({ children }: { children?: React.ReactNode }) => children;
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
    Input: () => null,
    Label: () => null,
    ListBox,
    toast: { info: vi.fn() },
  };
});

describe("YearSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render years sorted from newest to oldest", () => {
    const { container } = render(
      <YearSelector years={[2022, 2024, 2023]} latestYear={2024} />,
    );

    expect(container).toMatchSnapshot();
    const options = screen
      .getAllByRole("option")
      .map((option) => option.textContent)
      .filter((option) => option && option !== "None");

    expect(options).toEqual(["2024", "2023", "2022"]);
  });

  it("should update query state when selection changes", () => {
    render(<YearSelector years={[2022, 2024]} latestYear={2024} />);

    fireEvent.change(screen.getByTestId("year-selector"), {
      target: { value: "2022" },
    });
    expect(mockSetYear).toHaveBeenCalledWith(2022);

    fireEvent.change(screen.getByTestId("year-selector"), {
      target: { value: "" },
    });
    expect(mockSetYear).toHaveBeenCalledWith(null);
  });

  it("should show adjustment toast only once", () => {
    const { rerender } = render(
      <YearSelector
        years={[2023, 2024]}
        latestYear={2024}
        wasAdjusted={true}
      />,
    );

    expect(toast.info).toHaveBeenCalledTimes(1);
    expect(toast.info).toHaveBeenCalledWith("Latest data is 2024");

    rerender(
      <YearSelector
        years={[2023, 2024]}
        latestYear={2024}
        wasAdjusted={true}
      />,
    );
    expect(toast.info).toHaveBeenCalledTimes(1);
  });

  it("should not show toast when year was not adjusted", () => {
    render(
      <YearSelector
        years={[2023, 2024]}
        latestYear={2024}
        wasAdjusted={false}
      />,
    );

    expect(toast.info).not.toHaveBeenCalled();
  });
});
