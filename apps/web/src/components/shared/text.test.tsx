import { Text, textVariants } from "@web/components/shared/text";
import { render } from "vitest-browser-react";

describe("textVariants", () => {
  it("should map each variant to its classes", () => {
    expect(textVariants({ tone: "strong" })).toBe("text-muted-strong");
    expect(textVariants({ tone: "inherit" })).toBe(
      "text-inherit [font-weight:inherit]",
    );
    expect(textVariants({ eyebrow: true })).toBe("uppercase");
  });

  it("should keep a layout class passed alongside a variant", () => {
    expect(
      textVariants({ className: "min-[721px]:sr-only", eyebrow: true }),
    ).toContain("min-[721px]:sr-only");
  });
});

describe("Text.Paragraph", () => {
  it("should render a paragraph with the strong tone and HeroUI's props", async () => {
    const screen = await render(
      <Text.Paragraph size="sm" tone="strong" weight="semibold">
        Fuel mix
      </Text.Paragraph>,
    );
    const paragraph = screen.getByText("Fuel mix");
    expect(paragraph.element().tagName).toBe("P");
    await expect.element(paragraph).toHaveClass("text-muted-strong");
    await expect.element(paragraph).toHaveClass("typography--body-sm");
    await expect.element(paragraph).toHaveClass("typography--weight-semibold");
  });

  it("should not forward the tone to HeroUI's colour", async () => {
    const screen = await render(
      <Text.Paragraph tone="inherit">Toyota</Text.Paragraph>,
    );
    const paragraph = screen.getByText("Toyota");
    await expect.element(paragraph).toHaveClass("text-inherit");
    await expect.element(paragraph).not.toHaveClass("typography--color-muted");
    await expect.element(paragraph).not.toHaveAttribute("tone");
  });

  it("should set the eyebrow in uppercase", async () => {
    const screen = await render(
      <Text.Paragraph eyebrow color="muted" size="xs">
        Registrations
      </Text.Paragraph>,
    );
    const paragraph = screen.getByText("Registrations");
    await expect.element(paragraph).toHaveClass("uppercase");
    await expect.element(paragraph).toHaveClass("typography--color-muted");
  });
});

describe("Text.Heading", () => {
  it("should keep the heading level", async () => {
    const screen = await render(
      <Text.Heading level={2}>All categories</Text.Heading>,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    await expect.element(heading).toHaveTextContent("All categories");
    await expect.element(heading).toHaveClass("typography--h2");
  });
});

describe("Text.Paragraph as a heading", () => {
  it("should keep the body-xs scale on an eyebrow exposed as a heading", async () => {
    const screen = await render(
      <Text.Paragraph eyebrow role="heading" aria-level={2} size="xs">
        All categories
      </Text.Paragraph>,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    await expect.element(heading).toHaveTextContent("All categories");
    await expect.element(heading).toHaveClass("typography--body-xs");
    await expect.element(heading).toHaveClass("uppercase");
    await expect.element(heading).not.toHaveClass("typography--h2");
  });
});
