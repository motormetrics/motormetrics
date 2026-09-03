import { toast } from "@heroui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  type OnUrlUpdateFunction,
  withNuqsTestingAdapter,
} from "nuqs/adapters/testing";
import { YearSelector } from "./year-selector";

const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
const capture = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({ default: { capture } }));

const wrapper = withNuqsTestingAdapter({
  searchParams: { year: "2024" },
  onUrlUpdate,
});

const lastUrlUpdate = () => onUrlUpdate.mock.calls.at(-1)?.[0];

vi.mock("@heroui/react", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
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
    ...actual,
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
      { wrapper },
    );

    expect(container).toMatchSnapshot();
    const options = screen
      .getAllByRole("option")
      .map((option) => option.textContent)
      .filter((option) => option && option !== "None");

    expect(options).toEqual(["2024", "2023", "2022"]);
  });

  it("should update query state when selection changes", async () => {
    render(<YearSelector years={[2022, 2024]} latestYear={2024} />, {
      wrapper,
    });

    fireEvent.change(screen.getByTestId("year-selector"), {
      target: { value: "2022" },
    });
    // nuqs flushes URL updates asynchronously.
    await waitFor(() =>
      expect(lastUrlUpdate()?.searchParams.get("year")).toBe("2022"),
    );
    expect(capture).toHaveBeenCalledWith("dashboard_filter_changed", {
      filter: "year",
      value: "2022",
    });

    fireEvent.change(screen.getByTestId("year-selector"), {
      target: { value: "" },
    });
    await waitFor(() =>
      expect(lastUrlUpdate()?.searchParams.get("year")).toBeNull(),
    );
  });

  it("should show adjustment toast only once", () => {
    const { rerender } = render(
      <YearSelector
        years={[2023, 2024]}
        latestYear={2024}
        wasAdjusted={true}
      />,
      { wrapper },
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
      { wrapper },
    );

    expect(toast.info).not.toHaveBeenCalled();
  });
});
