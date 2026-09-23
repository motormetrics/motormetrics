import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { PageNotFound } from "./page-not-found";

describe("PageNotFound", () => {
  it("renders the 404 error message", async () => {
    const screen = await render(<PageNotFound />);

    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText("404")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Page Not Found"))
      .toBeInTheDocument();
    await expect
      .element(
        screen.getByText(
          "The page you're looking for doesn't exist or has been moved.",
        ),
      )
      .toBeInTheDocument();
  });

  it("renders navigation buttons", async () => {
    const screen = await render(<PageNotFound />);

    await expect
      .element(screen.getByText("Go to Homepage"))
      .toBeInTheDocument();
    await expect.element(screen.getByText("Go Back")).toBeInTheDocument();
  });

  it("should go back when Go Back button is clicked", async () => {
    const historyBackSpy = vi
      .spyOn(history, "back")
      .mockImplementation(() => {});
    const screen = await render(<PageNotFound />);

    await screen.getByRole("button", { name: "Go Back" }).click();
    expect(historyBackSpy).toHaveBeenCalledTimes(1);

    historyBackSpy.mockRestore();
  });

  it("renders help text with links", async () => {
    const screen = await render(<PageNotFound />);

    await expect
      .element(screen.getByText(/Need help\? Visit our/))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/or go back to the/))
      .toBeInTheDocument();
  });

  it("has correct link href attributes", async () => {
    const screen = await render(<PageNotFound />);

    await expect
      .element(screen.getByRole("link", { name: /learn page/i }))
      .toHaveAttribute("href", "/learn");
  });
});
