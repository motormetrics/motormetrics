import type { ErrorInfo } from "next/error";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { SectionErrorBoundary, SectionErrorFallback } from "./error-boundary";

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

vi.mock("next/error", () => ({
  catchError: () =>
    function MockSectionErrorBoundary({
      children,
      title,
    }: {
      children?: React.ReactNode;
      title?: string;
    }) {
      return (
        <div data-testid="section-error-boundary" data-title={title}>
          {children}
        </div>
      );
    },
}));

describe("SectionErrorFallback", () => {
  it("should render the default title and error message", async () => {
    const retry = vi.fn();
    const errorInfo = {
      error: new Error("Query failed"),
      retry,
      reset: retry,
    } as ErrorInfo;

    const screen = await render(SectionErrorFallback({}, errorInfo));

    await expect.element(screen.getByRole("alert")).toBeInTheDocument();
    await expect
      .element(screen.getByText("This section failed to load"))
      .toBeInTheDocument();
    await expect.element(screen.getByText("Query failed")).toBeInTheDocument();
  });

  it("should render a custom title and fallback message for non-Error values", async () => {
    const retry = vi.fn();
    const errorInfo = {
      error: "not-an-error",
      retry,
      reset: retry,
    } as unknown as ErrorInfo;

    const screen = await render(
      SectionErrorFallback(
        { title: "Registration data unavailable" },
        errorInfo,
      ),
    );

    await expect
      .element(screen.getByText("Registration data unavailable"))
      .toBeInTheDocument();
    await expect
      .element(
        screen.getByText("Something went wrong while loading this data."),
      )
      .toBeInTheDocument();
  });

  it("should call retry when Try again is pressed", async () => {
    const retry = vi.fn();
    const errorInfo = {
      error: new Error("Boom"),
      retry,
      reset: retry,
    } as ErrorInfo;

    const screen = await render(
      SectionErrorFallback({ title: "COE results unavailable" }, errorInfo),
    );

    await screen.getByRole("button", { name: "Try again" }).click();

    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("SectionErrorBoundary", () => {
  it("should wrap children via catchError", async () => {
    const screen = await render(
      <SectionErrorBoundary title="Top makes unavailable">
        <span>Child content</span>
      </SectionErrorBoundary>,
    );

    await expect
      .element(screen.getByTestId("section-error-boundary"))
      .toHaveAttribute("data-title", "Top makes unavailable");
    await expect.element(screen.getByText("Child content")).toBeInTheDocument();
  });
});
