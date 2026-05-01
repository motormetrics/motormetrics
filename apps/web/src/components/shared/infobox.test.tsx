import { render, screen } from "@testing-library/react";
import { Infobox } from "./infobox";

vi.mock("@heroui/react", () => {
  const Alert = ({
    status,
    className,
    children,
  }: {
    status?: string;
    className?: string;
    children: React.ReactNode;
  }) => (
    <section data-testid="alert" data-status={status} className={className}>
      {children}
    </section>
  );

  Alert.Content = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  Alert.Title = ({ children }: { children: React.ReactNode }) => (
    <h3>{children}</h3>
  );
  Alert.Description = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  );

  return { Alert };
});

describe("Infobox", () => {
  it("should render title and markdown content", () => {
    const { container } = render(
      <Infobox
        title="What is COE?"
        content="**Certificate of Entitlement** controls vehicle ownership."
      />,
    );

    expect(container).toMatchSnapshot();
    expect(screen.getByRole("heading", { name: "What is COE?" })).toBeVisible();
    expect(screen.getByText("Certificate of Entitlement")).toBeVisible();
  });

  it("should use the expected alert styling", () => {
    render(<Infobox title="Info" content="A short note" />);

    const alert = screen.getByTestId("alert");
    expect(alert).toHaveAttribute("data-status", "accent");
    expect(alert).toHaveClass("border", "border-accent/30", "px-4", "py-3");
  });
});
