import { render } from "@testing-library/react";
import { Footer } from "@web/components/footer";
import { afterEach, beforeEach, vi } from "vitest";

vi.mock("../../package.json", () => ({ version: "0.0.0-test" }));

describe("Footer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render asynchronous footer content with version information", async () => {
    const footer = await Footer();
    const { container, getByText } = render(footer);
    expect(container).toMatchSnapshot();
    expect(getByText(/All rights reserved/)).toBeInTheDocument();
    expect(getByText(/Privacy Policy/)).toBeInTheDocument();
  });
});
