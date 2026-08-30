import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppError from "./error";

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

  it("should render the error message and retry action", () => {
    const retry = vi.fn();
    const error = Object.assign(new Error("Boom"), { digest: "abc123" });

    render(<AppError error={error} retry={retry} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We couldn't load this page. You can try again, or head back to the homepage.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Error ID: abc123")).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it("should omit the error id when digest is missing", () => {
    render(<AppError error={new Error("Boom")} retry={vi.fn()} />);

    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
  });

  it("should call retry when Try again is pressed", () => {
    const retry = vi.fn();
    render(<AppError error={new Error("Boom")} retry={retry} />);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
