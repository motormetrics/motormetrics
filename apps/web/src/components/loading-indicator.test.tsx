import { render } from "vitest-browser-react";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
  useLinkStatus: () => ({ pending: true }),
}));

describe("LoadingIndicator", () => {
  it("should render progress bar when pending", async () => {
    const { default: LoadingIndicator } = await import("./loading-indicator");

    const screen = await render(<LoadingIndicator />);

    expect(screen.container).toMatchSnapshot();
  });
});
