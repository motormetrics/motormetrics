import GlobalError from "@web/app/global-error";
import posthog from "posthog-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("posthog-js", () => ({
  default: { captureException: vi.fn() },
}));

vi.mock("next/font/google", () => ({
  Urbanist: () => ({ variable: "mock-urbanist" }),
}));

vi.mock("@web/app/globals.css", () => ({}));

describe("GlobalError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("should render the critical error message and retry action", async () => {
    const retry = vi.fn();
    const error = Object.assign(new Error("Critical"), { digest: "xyz789" });

    const screen = await render(<GlobalError error={error} retry={retry} />);

    await expect
      .element(screen.getByText("Something went wrong"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("A critical error occurred. Please try again."))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Error ID: xyz789"))
      .toBeInTheDocument();
    expect(posthog.captureException).toHaveBeenCalledWith(error);
  });

  it("should omit the error id when digest is missing", async () => {
    const screen = await render(
      <GlobalError error={new Error("Critical")} retry={vi.fn()} />,
    );

    await expect.element(screen.getByText(/Error ID:/)).not.toBeInTheDocument();
  });

  it("should call retry when Try again is clicked", async () => {
    const retry = vi.fn();
    const screen = await render(
      <GlobalError error={new Error("Critical")} retry={retry} />,
    );

    await screen.getByRole("button", { name: "Try again" }).click();

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
