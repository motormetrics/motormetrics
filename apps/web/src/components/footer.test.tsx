import { Footer } from "@web/components/footer";
import { vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("../../package.json", () => ({ version: "0.0.0-test" }));

describe("Footer", () => {
  it("should render the shell footer with navigation and version information", async () => {
    const screen = await render(<Footer />);

    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText(/v0\.0\.0-test/)).toBeInTheDocument();
    await expect.element(screen.getByText("Privacy")).toBeInTheDocument();
    await expect.element(screen.getByText("LTA DataMall")).toBeInTheDocument();
    await expect.element(screen.getByText("Advertise")).not.toBeInTheDocument();
  });

  it("should link every header section as a plain anchor", async () => {
    const screen = await render(<Footer />);
    const sections = screen.getByRole("navigation", { name: "Site sections" });

    for (const [name, href] of [
      ["Cars overview", "/cars"],
      ["COE overview", "/coe"],
      ["PARF calculator", "/cars/parf"],
      ["EV charging", "/cars/electric-vehicles/charging"],
      ["Premiums by category", "/coe/premiums"],
    ]) {
      await expect
        .element(sections.getByRole("link", { name }))
        .toHaveAttribute("href", href);
    }
  });

  it("should render Advertise when the flag is on, with social icons", async () => {
    const screen = await render(
      <Footer
        navItems={[
          { href: "/about", label: "About" },
          { href: "/learn", label: "Learn" },
          { href: "/advertise", label: "Advertise" },
          { href: "/legal/privacy-policy", label: "Privacy" },
          { href: "/legal/terms-of-service", label: "Terms" },
        ]}
      />,
    );

    await expect.element(screen.getByText("Advertise")).toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: "Instagram" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: "Telegram" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: "GitHub" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: "X" }))
      .toBeInTheDocument();
  });
});
