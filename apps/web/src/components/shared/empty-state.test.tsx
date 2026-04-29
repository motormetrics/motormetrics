import { fireEvent, render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => <div className={className}>{children}</div>,
  },
}));

describe("EmptyState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render default title and description", () => {
    render(<EmptyState />);

    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText("No Data Available")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The requested data could not be found. Please try a different selection.",
      ),
    ).toBeInTheDocument();
  });

  it("should render default action buttons", () => {
    render(<EmptyState />);

    expect(
      screen.getByRole("button", { name: /go home/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go back/i }),
    ).toBeInTheDocument();
  });

  it("should render Go Home as a link to /", () => {
    render(<EmptyState />);

    const homeButton = screen.getByRole("button", { name: /go home/i });
    expect(homeButton.closest("a")).toHaveAttribute("href", "/");
  });

  it("should render custom title and description", () => {
    render(
      <EmptyState title="Custom Title" description="Custom description text" />,
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom description text")).toBeInTheDocument();
  });

  it("should render custom icon", () => {
    render(<EmptyState icon={<span data-testid="custom-icon">Icon</span>} />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render custom actions", () => {
    render(
      <EmptyState
        actions={<button type="button">Custom Action</button>}
        showDefaultActions={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: /custom action/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /go home/i }),
    ).not.toBeInTheDocument();
  });

  it("should hide default actions when showDefaultActions is false", () => {
    render(<EmptyState showDefaultActions={false} />);

    expect(
      screen.queryByRole("button", { name: /go home/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /go back/i }),
    ).not.toBeInTheDocument();
  });

  it("should call history.back when Go Back button is clicked", () => {
    const historyBackSpy = vi.spyOn(history, "back");
    render(<EmptyState />);

    fireEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(historyBackSpy).toHaveBeenCalled();

    historyBackSpy.mockRestore();
  });

  it("should apply custom className", () => {
    const { container } = render(<EmptyState className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
