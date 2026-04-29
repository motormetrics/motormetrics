import { render, screen } from "@testing-library/react";
import Typography from "./typography";

describe("Typography", () => {
  describe("Headings", () => {
    it("should render H1", () => {
      render(<Typography.H1>Page Title</Typography.H1>);
      expect(document.body.firstChild).toMatchSnapshot();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Page Title",
      );
    });

    it("should render H2", () => {
      render(<Typography.H2>Section Title</Typography.H2>);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Section Title",
      );
    });

    it("should render H3", () => {
      render(<Typography.H3>Card Title</Typography.H3>);
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Card Title",
      );
    });

    it("should render H4", () => {
      render(<Typography.H4>Small Heading</Typography.H4>);
      expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
        "Small Heading",
      );
    });
  });

  describe("Body Text", () => {
    it("should render TextLg", () => {
      render(<Typography.TextLg>Large text content</Typography.TextLg>);
      expect(screen.getByText("Large text content")).toBeInTheDocument();
    });

    it("should render Text", () => {
      render(<Typography.Text>Body text content</Typography.Text>);
      expect(screen.getByText("Body text content")).toBeInTheDocument();
    });

    it("should render TextSm", () => {
      render(<Typography.TextSm>Small text content</Typography.TextSm>);
      expect(screen.getByText("Small text content")).toBeInTheDocument();
    });
  });

  describe("UI Labels", () => {
    it("should render Label", () => {
      render(<Typography.Label>Form Label</Typography.Label>);
      expect(screen.getByText("Form Label")).toBeInTheDocument();
    });

    it("should render Caption", () => {
      render(<Typography.Caption>Metadata text</Typography.Caption>);
      expect(screen.getByText("Metadata text")).toBeInTheDocument();
    });
  });

  describe("Content Elements", () => {
    it("should render P", () => {
      render(<Typography.P>Paragraph content</Typography.P>);
      expect(screen.getByText("Paragraph content")).toBeInTheDocument();
    });

    it("should render Blockquote", () => {
      render(<Typography.Blockquote>Quoted text</Typography.Blockquote>);
      expect(screen.getByText("Quoted text")).toBeInTheDocument();
    });

    it("should render List", () => {
      render(
        <Typography.List>
          <li>Item 1</li>
        </Typography.List>,
      );
      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("should render InlineCode", () => {
      render(<Typography.InlineCode>code snippet</Typography.InlineCode>);
      expect(screen.getByText("code snippet")).toBeInTheDocument();
    });

    it("should render Lead", () => {
      render(<Typography.Lead>Lead paragraph</Typography.Lead>);
      expect(screen.getByText("Lead paragraph")).toBeInTheDocument();
    });
  });

  describe("Custom classNames", () => {
    it("should apply custom className to H1", () => {
      render(<Typography.H1 className="custom-class">Heading</Typography.H1>);
      expect(screen.getByRole("heading", { level: 1 })).toHaveClass(
        "custom-class",
      );
    });
  });
});
