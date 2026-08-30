import { fireEvent, render, screen } from "@testing-library/react";
import type { ErrorInfo } from "next/error";
import { describe, expect, it, vi } from "vitest";
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
  it("should render the default title and error message", () => {
    const retry = vi.fn();
    const errorInfo = {
      error: new Error("Query failed"),
      retry,
      reset: retry,
    } as ErrorInfo;

    render(SectionErrorFallback({}, errorInfo));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("This section failed to load")).toBeInTheDocument();
    expect(screen.getByText("Query failed")).toBeInTheDocument();
  });

  it("should render a custom title and fallback message for non-Error values", () => {
    const retry = vi.fn();
    const errorInfo = {
      error: "not-an-error",
      retry,
      reset: retry,
    } as unknown as ErrorInfo;

    render(
      SectionErrorFallback(
        { title: "Registration data unavailable" },
        errorInfo,
      ),
    );

    expect(
      screen.getByText("Registration data unavailable"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Something went wrong while loading this data."),
    ).toBeInTheDocument();
  });

  it("should call retry when Try again is pressed", () => {
    const retry = vi.fn();
    const errorInfo = {
      error: new Error("Boom"),
      retry,
      reset: retry,
    } as ErrorInfo;

    render(
      SectionErrorFallback({ title: "COE results unavailable" }, errorInfo),
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("SectionErrorBoundary", () => {
  it("should wrap children via catchError", () => {
    render(
      <SectionErrorBoundary title="Top makes unavailable">
        <span>Child content</span>
      </SectionErrorBoundary>,
    );

    expect(screen.getByTestId("section-error-boundary")).toHaveAttribute(
      "data-title",
      "Top makes unavailable",
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
