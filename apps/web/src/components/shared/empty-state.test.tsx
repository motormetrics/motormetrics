import { render } from "vitest-browser-react";
import { EmptyState } from "./empty-state";

vi.mock("motion/react-client", () => ({
  div: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

describe("EmptyState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render default title and description", async () => {
    const screen = await render(<EmptyState />);

    expect(screen.container).toMatchSnapshot();
    await expect
      .element(screen.getByText("No Data Available", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(
        screen.getByText(
          "The requested data could not be found. Please try a different selection.",
          { exact: true },
        ),
      )
      .toBeInTheDocument();
  });

  it("should render default action buttons", async () => {
    const screen = await render(<EmptyState />);

    await expect
      .element(screen.getByRole("button", { name: /go home/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /go back/i }))
      .toBeInTheDocument();
  });

  it("should render Go Home as a link to /", async () => {
    const screen = await render(<EmptyState />);

    const homeButton = screen.getByRole("button", { name: /go home/i });
    expect(homeButton.element().closest("a")).toHaveAttribute("href", "/");
  });

  it("should render custom title and description", async () => {
    const screen = await render(
      <EmptyState title="Custom Title" description="Custom description text" />,
    );

    await expect
      .element(screen.getByText("Custom Title", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Custom description text", { exact: true }))
      .toBeInTheDocument();
  });

  it("should render custom icon", async () => {
    const screen = await render(
      <EmptyState icon={<span data-testid="custom-icon">Icon</span>} />,
    );

    await expect.element(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render custom actions", async () => {
    const screen = await render(
      <EmptyState
        actions={<button type="button">Custom Action</button>}
        showDefaultActions={false}
      />,
    );

    await expect
      .element(screen.getByRole("button", { name: /custom action/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /go home/i }))
      .not.toBeInTheDocument();
  });

  it("should hide default actions when showDefaultActions is false", async () => {
    const screen = await render(<EmptyState showDefaultActions={false} />);

    await expect
      .element(screen.getByRole("button", { name: /go home/i }))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /go back/i }))
      .not.toBeInTheDocument();
  });

  it("should call history.back when Go Back button is clicked", async () => {
    const historyBackSpy = vi
      .spyOn(history, "back")
      .mockImplementation(() => {});
    const screen = await render(<EmptyState />);

    await screen.getByRole("button", { name: /go back/i }).click();
    expect(historyBackSpy).toHaveBeenCalled();

    historyBackSpy.mockRestore();
  });

  it("should apply custom className", async () => {
    const screen = await render(<EmptyState className="custom-class" />);
    expect(screen.container.firstChild).toHaveClass("custom-class");
  });
});
