import { render } from "@testing-library/react";
import { Footer } from "@web/components/footer";
import { vi } from "vitest";

vi.mock("../../package.json", () => ({ version: "0.0.0-test" }));

describe("Footer", () => {
  it("should render the shell footer with navigation and version information", () => {
    const { container, getByText } = render(<Footer />);

    expect(container).toMatchSnapshot();
    expect(getByText(/v0\.0\.0-test/)).toBeInTheDocument();
    expect(getByText("Privacy")).toBeInTheDocument();
    expect(getByText("LTA DataMall")).toBeInTheDocument();
  });
});
