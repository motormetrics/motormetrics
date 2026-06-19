import { render, screen } from "@testing-library/react";
import { LinkWithParams } from "./link-with-params";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

vi.mock("next/link", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock requires loose typing
  default: ({ href, children, ...props }: any) => (
    <a
      href={typeof href === "object" ? `${href.pathname}?${href.query}` : href}
      {...props}
    >
      {children}
    </a>
  ),
}));

const mockUseSearchParams = vi.mocked(
  await import("next/navigation"),
).useSearchParams;

describe("LinkWithParams", () => {
  it("should render with basic props", () => {
    mockUseSearchParams.mockReturnValue({
      toString: () => "",
      // biome-ignore lint/suspicious/noExplicitAny: test mock requires loose typing
    } as any);

    render(
      <LinkWithParams href="/test">
        <span>Test Link</span>
      </LinkWithParams>,
    );

    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByRole("link")).toBeInTheDocument();
    expect(screen.getByText("Test Link")).toBeInTheDocument();
  });

  it("should render with search params", () => {
    mockUseSearchParams.mockReturnValue({
      toString: () => "foo=bar",
      // biome-ignore lint/suspicious/noExplicitAny: test mock requires loose typing
    } as any);

    render(
      <LinkWithParams href="/test">
        <span>Test Link</span>
      </LinkWithParams>,
    );

    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
