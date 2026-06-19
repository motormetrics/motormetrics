import { render, screen } from "@testing-library/react";
import { ShareButtons } from "@web/app/(main)/(site)/blog/components/share-buttons";

vi.mock("@heroui/react", () => ({
  Button: ({
    children,
    isIconOnly: _isIconOnly,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isIconOnly?: boolean;
  }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@icons-pack/react-simple-icons", () => ({
  SiX: ({ className }: { className?: string }) => (
    <svg className={className} data-testid="icon-x" />
  ),
  SiTelegram: ({ className }: { className?: string }) => (
    <svg className={className} data-testid="icon-telegram" />
  ),
  SiWhatsapp: ({ className }: { className?: string }) => (
    <svg className={className} data-testid="icon-whatsapp" />
  ),
}));

vi.mock("@web/config", () => ({
  SITE_URL: "https://motormetrics.app",
}));

describe("ShareButtons", () => {
  it("should render share buttons with LinkedIn link", () => {
    render(<ShareButtons url="/blog/test-post" title="Test Post" />);

    const linkedinLink = screen.getByTitle("Share on LinkedIn");
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute(
      "href",
      expect.stringContaining("linkedin.com"),
    );
  });

  it("should render all social share buttons", () => {
    render(<ShareButtons url="/blog/test-post" title="Test Post" />);

    expect(screen.getByTitle("Share on X")).toBeInTheDocument();
    expect(screen.getByTitle("Share on LinkedIn")).toBeInTheDocument();
    expect(screen.getByTitle("Share on Telegram")).toBeInTheDocument();
    expect(screen.getByTitle("Share on WhatsApp")).toBeInTheDocument();
  });

  it("should render native share button", () => {
    render(<ShareButtons url="/blog/test-post" title="Test Post" />);

    expect(screen.getByLabelText("Share")).toBeInTheDocument();
  });

  it("should build correct LinkedIn share URL", () => {
    render(<ShareButtons url="/blog/test-post" title="Test Post" />);

    const linkedinLink = screen.getByTitle("Share on LinkedIn");
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fmotormetrics.app%2Fblog%2Ftest-post",
    );
  });
});
