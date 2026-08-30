import { render } from "@testing-library/react";
import { Footer } from "@web/components/footer";
import { vi } from "vitest";

vi.mock("../../package.json", () => ({ version: "0.0.0-test" }));

describe("Footer", () => {
  it("should render the shell footer with navigation and version information", () => {
    const { container, getByText, queryByText } = render(<Footer />);

    expect(container).toMatchSnapshot();
    expect(getByText(/v0\.0\.0-test/)).toBeInTheDocument();
    expect(getByText("Privacy")).toBeInTheDocument();
    expect(getByText("LTA DataMall")).toBeInTheDocument();
    expect(queryByText("Advertise")).not.toBeInTheDocument();
  });

  it("should render Advertise and social icons when those flags are on", () => {
    const { getByRole, getByText } = render(
      <Footer
        navItems={[
          { href: "/about", label: "About" },
          { href: "/learn", label: "Learn" },
          { href: "/advertise", label: "Advertise" },
          { href: "/legal/privacy-policy", label: "Privacy" },
          { href: "/legal/terms-of-service", label: "Terms" },
        ]}
        showSocialLinks
      />,
    );

    expect(getByText("Advertise")).toBeInTheDocument();
    expect(getByRole("link", { name: "Instagram" })).toBeInTheDocument();
    expect(getByRole("link", { name: "Telegram" })).toBeInTheDocument();
    expect(getByRole("link", { name: "GitHub" })).toBeInTheDocument();
  });
});
