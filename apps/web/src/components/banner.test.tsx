import { Banner } from "@web/components/banner";
import { vi } from "vitest";
import { render } from "vitest-browser-react";
import { createUseStoreMock } from "../../tests/test-utils";

const { state: mockStoreState } = createUseStoreMock();

vi.mock("@web/app/store", () => ({
  __esModule: true,
  default: (selector?: (state: typeof mockStoreState) => unknown) =>
    selector ? selector(mockStoreState) : mockStoreState,
}));

describe("Banner", () => {
  beforeEach(() => {
    mockStoreState.bannerContent = null;
    mockStoreState.setBannerContent.mockClear();
  });

  it("should show banner content from the store", async () => {
    mockStoreState.bannerContent = (
      <span data-testid="banner-content">Hello COE</span>
    );

    const screen = await render(<Banner />);

    expect(screen.container).toMatchSnapshot();
    await expect
      .element(screen.getByTestId("banner-content"))
      .toHaveTextContent("Hello COE");
  });

  it("should return null when no banner content is set", async () => {
    mockStoreState.bannerContent = null;

    const screen = await render(<Banner />);
    expect(screen.container).toBeEmptyDOMElement();
  });
});
