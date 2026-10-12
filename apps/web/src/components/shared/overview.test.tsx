import {
  Headline,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import { render } from "vitest-browser-react";

describe("SectionLink", () => {
  it("should pass rel through for an external link", async () => {
    const screen = await render(
      <SectionLink
        href="https://www.lta.gov.sg"
        rel="noopener noreferrer nofollow"
      >
        LTA announcement
      </SectionLink>,
    );
    await expect
      .element(screen.getByRole("link", { name: "LTA announcement" }))
      .toHaveAttribute("rel", "noopener noreferrer nofollow");
  });
});

describe("SectionHead", () => {
  it("should render the eyebrow, heading, caption and link", async () => {
    const screen = await render(
      <SectionHead
        caption="2025 year to date"
        eyebrow="Registrations"
        link={{ href: "/cars/makes", label: "All makes" }}
        title="Top makes"
      />,
    );
    await expect.element(screen.getByText("Registrations")).toBeInTheDocument();
    await expect
      .element(screen.getByRole("heading", { level: 2 }))
      .toHaveTextContent("Top makes");
    await expect
      .element(screen.getByText("2025 year to date"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: "All makes" }))
      .toHaveAttribute("href", "/cars/makes");
  });

  it("should set the eyebrow in uppercase", async () => {
    const screen = await render(
      <SectionHead eyebrow="Registrations" title="Top makes" />,
    );
    await expect
      .element(screen.getByText("Registrations"))
      .toHaveClass("uppercase");
  });

  it("should size the eyebrow and caption with HeroUI's scale", async () => {
    const screen = await render(
      <SectionHead
        caption="2025 year to date"
        eyebrow="Registrations"
        title="Top makes"
      />,
    );
    await expect
      .element(screen.getByText("Registrations"))
      .toHaveClass("typography--body-xs");
    await expect
      .element(screen.getByText("2025 year to date"))
      .toHaveClass("typography--body-sm");
  });
});

describe("SourceNote", () => {
  it("should render the source line as a paragraph", async () => {
    const screen = await render(
      <SourceNote>Source: LTA via DataMall</SourceNote>,
    );
    const note = screen.getByText("Source: LTA via DataMall");
    await expect.element(note).toBeInTheDocument();
    expect(note.element().tagName).toBe("P");
  });

  it("should use HeroUI's xs paragraph size", async () => {
    const screen = await render(
      <SourceNote>Source: LTA via DataMall</SourceNote>,
    );
    const note = screen.getByText("Source: LTA via DataMall");
    await expect.element(note).toHaveClass("typography--body-xs");
    await expect.element(note).not.toHaveClass("text-xs");
  });
});

describe("Headline", () => {
  it("should render the label, figure, delta and caption", async () => {
    const screen = await render(
      <Headline
        caption="vs September"
        delta={<span>+5.2%</span>}
        label="New car registrations"
        value="6,100"
      />,
    );
    await expect
      .element(screen.getByText("New car registrations"))
      .toBeInTheDocument();
    await expect.element(screen.getByText("6,100")).toBeInTheDocument();
    await expect.element(screen.getByText("+5.2%")).toBeInTheDocument();
    await expect.element(screen.getByText("vs September")).toBeInTheDocument();
  });
});
