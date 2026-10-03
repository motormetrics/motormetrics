import { Footer } from "@web/components/footer";
import { render } from "vitest-browser-react";

describe("Footer", () => {
  it("should render the shell footer with navigation", async () => {
    const screen = await render(<Footer />);

    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText("Privacy")).toBeInTheDocument();
    await expect.element(screen.getByText("LTA DataMall")).toBeInTheDocument();
    await expect.element(screen.getByText("Advertise")).not.toBeInTheDocument();
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
