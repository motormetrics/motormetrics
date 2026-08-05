import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GlobalError from "./global-error";

vi.mock("next/font/google", () => ({
  Geist: () => ({ className: "mock-geist" }),
}));

vi.mock("./globals.css", () => ({}));

describe("GlobalError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("should render the critical error message and retry action", () => {
    const retry = vi.fn();
    const error = Object.assign(new Error("Critical"), { digest: "xyz789" });

    render(<GlobalError error={error} retry={retry} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("A critical error occurred. Please try again."),
    ).toBeInTheDocument();
    expect(screen.getByText("Error ID: xyz789")).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it("should omit the error id when digest is missing", () => {
    render(<GlobalError error={new Error("Critical")} retry={vi.fn()} />);

    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
  });

  it("should call retry when Try again is clicked", () => {
    const retry = vi.fn();
    render(<GlobalError error={new Error("Critical")} retry={retry} />);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
