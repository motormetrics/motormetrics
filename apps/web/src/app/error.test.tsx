import AppError from "@web/app/error";
import posthog from "posthog-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("posthog-js", () => ({
  default: { captureException: vi.fn() },
}));

vi.mock("@heroui/react", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  Button: ({
    children,
    onPress,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    onPress?: () => void;
  }) => (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onPress?.();
        props.onClick?.(event);
      }}
    >
      {children}
    </button>
  ),
  cn: (...classes: unknown[]) => classes.flat().filter(Boolean).join(" "),
}));

describe("AppError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("should render the error message and retry action", async () => {
    const retry = vi.fn();
    const error = Object.assign(new Error("Boom"), { digest: "abc123" });

    const screen = await render(<AppError error={error} retry={retry} />);

    await expect
      .element(screen.getByText("Something went wrong", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(
        screen.getByText(
          "We couldn't load this page. You can try again, or head back to the homepage.",
          { exact: true },
        ),
      )
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Error ID: abc123", { exact: true }))
      .toBeInTheDocument();
    expect(posthog.captureException).toHaveBeenCalledWith(error);
  });

  it("should omit the error id when digest is missing", async () => {
    const screen = await render(
      <AppError error={new Error("Boom")} retry={vi.fn()} />,
    );

    await expect.element(screen.getByText(/Error ID:/)).not.toBeInTheDocument();
  });

  it("should call retry when Try again is pressed", async () => {
    const retry = vi.fn();
    const screen = await render(
      <AppError error={new Error("Boom")} retry={retry} />,
    );

    await screen
      .getByRole("button", { name: "Try again", exact: true })
      .click();

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
