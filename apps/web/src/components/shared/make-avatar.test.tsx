import { MakeAvatar } from "@web/components/shared/make-avatar";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

// The browser mocker hands a CommonJS dependency's whole factory result to a
// default import, and it must be an object. Spreading a forwardRef component in
// keeps the mocked module itself a valid React element type.
vi.mock("next/image", async () => {
  const { forwardRef } = await import("react");
  const MockImage = forwardRef<
    HTMLImageElement,
    ComponentProps<"img"> & { fill?: boolean }
  >(({ alt, fill: _fill, ...props }, ref) => (
    // biome-ignore lint/performance/noImgElement: stands in for next/image itself
    <img alt={alt} ref={ref} {...props} />
  ));
  return { ...MockImage, default: MockImage };
});

describe("MakeAvatar", () => {
  it("should render the logo as an image named after the make", async () => {
    const screen = await render(
      <MakeAvatar logoUrl="https://cdn.example/bmw.png" make="BMW" />,
    );
    await expect
      .element(screen.getByRole("img", { name: "BMW logo" }))
      .toBeInTheDocument();
  });

  it("should inset the logo inside the avatar's rounded corners", async () => {
    const screen = await render(
      <MakeAvatar logoUrl="https://cdn.example/bmw.png" make="BMW" />,
    );
    const logo = screen.getByRole("img", { name: "BMW logo" }).element();
    expect(logo.getAttribute("width")).toBe("30");
  });

  it("should render a hidden initial when there is no logo", async () => {
    const screen = await render(<MakeAvatar logoUrl={null} make="audi" />);
    const initial = screen.getByText("A", { exact: true }).element();
    expect(initial.getAttribute("aria-hidden")).toBe("true");
  });

  it("should use HeroUI's small size when asked", async () => {
    const screen = await render(
      <MakeAvatar logoUrl={null} make="Audi" size="sm" />,
    );
    expect(screen.container.querySelector(".avatar--sm")).not.toBeNull();
  });
});
