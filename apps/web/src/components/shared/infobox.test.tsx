import { render, screen } from "@testing-library/react";
import { Infobox } from "./infobox";

vi.mock("@heroui/alert", () => ({
  Alert: ({
    title,
    description,
    color,
    variant,
    className,
  }: {
    title: string;
    description: React.ReactNode;
    color: string;
    variant: string;
    className?: string;
  }) => (
    <section
      data-testid="alert"
      data-color={color}
      data-variant={variant}
      className={className}
    >
      <h3>{title}</h3>
      <div data-testid="alert-description">{description}</div>
    </section>
  ),
}));

describe("Infobox", () => {
  it("should render title and markdown content", () => {
    const { container } = render(
      <Infobox
        title="What is COE?"
        content="The **Certificate of Entitlement** controls vehicle ownership."
      />,
    );

    expect(container).toMatchSnapshot();
    expect(screen.getByRole("heading", { name: "What is COE?" })).toBeVisible();
    expect(screen.getByText("Certificate of Entitlement")).toBeVisible();
  });

  it("should use the expected alert styling", () => {
    render(<Infobox title="Info" content="A short note" />);

    const alert = screen.getByTestId("alert");
    expect(alert).toHaveAttribute("data-color", "primary");
    expect(alert).toHaveAttribute("data-variant", "bordered");
    expect(alert).toHaveClass("px-4", "py-3");
  });
});
