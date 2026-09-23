import type { ReadonlyURLSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { render } from "vitest-browser-react";
import { LinkWithParams } from "./link-with-params";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

interface MockLinkProps {
  href: string | { pathname: string; query: string };
  children?: ReactNode;
}

// next/link is CommonJS whose `module.exports` is the Link component itself, and
// browser mode resolves its default import to the whole mocked module. Spreading
// a forwardRef component in keeps the mocked module a valid React element type.
vi.mock("next/link", async () => {
  const { forwardRef } = await import("react");
  const MockLink = forwardRef<HTMLAnchorElement, MockLinkProps>(
    ({ href, children, ...props }, ref) => (
      <a
        ref={ref}
        href={
          typeof href === "object" ? `${href.pathname}?${href.query}` : href
        }
        {...props}
      >
        {children}
      </a>
    ),
  );
  return { ...MockLink, default: MockLink };
});

const mockUseSearchParams = vi.mocked(
  await import("next/navigation"),
).useSearchParams;

describe("LinkWithParams", () => {
  it("should render with basic props", async () => {
    mockUseSearchParams.mockReturnValue({
      toString: () => "",
    } as unknown as ReadonlyURLSearchParams);

    const screen = await render(
      <LinkWithParams href="/test">
        <span>Test Link</span>
      </LinkWithParams>,
    );

    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByRole("link")).toBeInTheDocument();
    await expect.element(screen.getByText("Test Link")).toBeInTheDocument();
  });

  it("should render with search params", async () => {
    mockUseSearchParams.mockReturnValue({
      toString: () => "foo=bar",
    } as unknown as ReadonlyURLSearchParams);

    const screen = await render(
      <LinkWithParams href="/test">
        <span>Test Link</span>
      </LinkWithParams>,
    );

    await expect.element(screen.getByRole("link")).toBeInTheDocument();
  });
});
