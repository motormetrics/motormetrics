import { render, screen } from "@testing-library/react";
import { Banner } from "@web/components/banner";
import { vi } from "vitest";
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

  it("should show banner content from the store", () => {
    mockStoreState.bannerContent = (
      <span data-testid="banner-content">Hello COE</span>
    );

    render(<Banner />);

    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByTestId("banner-content")).toHaveTextContent("Hello COE");
  });

  it("should return null when no banner content is set", () => {
    mockStoreState.bannerContent = null;

    const { container } = render(<Banner />);
    expect(container).toBeEmptyDOMElement();
  });
});
