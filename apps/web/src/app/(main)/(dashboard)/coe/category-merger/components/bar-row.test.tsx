import { BarRow } from "@web/app/(main)/(dashboard)/coe/category-merger/components/bar-row";
import { render } from "vitest-browser-react";

describe("BarRow", () => {
  it("should size the fill to the share", async () => {
    const screen = await render(
      <BarRow label="Toyota" share={60.25} value="6,843" />,
    );
    await expect.element(screen.getByText("Toyota")).toBeInTheDocument();
    await expect
      .element(screen.getByRole("progressbar", { name: "Toyota" }))
      .toHaveAttribute("aria-valuenow", "60.25");
  });

  it("should clamp the share to the track", async () => {
    const screen = await render(<BarRow label="A" share={140} value="1" />);
    await expect
      .element(screen.getByRole("progressbar", { name: "A" }))
      .toHaveAttribute("aria-valuenow", "100");
  });

  it("should use HeroUI's large bar with no track overrides", async () => {
    const screen = await render(<BarRow label="A" share={40} value="1" />);
    await expect
      .element(screen.getByRole("progressbar", { name: "A" }))
      .toHaveClass("progress-bar--lg");
    expect(
      screen.container.querySelector(".progress-bar__track"),
    ).not.toHaveClass("rounded-full");
  });
});
