import { render } from "@testing-library/react";
import { PremiumBanner } from "@web/components/premium-banner";
import type { COEResult } from "@web/types";
import type { ReactElement } from "react";
import { vi } from "vitest";
import { createUseStoreMock } from "../../tests/test-utils";

const { state: mockStoreState } = createUseStoreMock();

vi.mock("@web/app/store", () => ({
  __esModule: true,
  default: (selector?: (state: typeof mockStoreState) => unknown) =>
    selector ? selector(mockStoreState) : mockStoreState,
}));

const createCoeResult = (
  vehicleClass: COEResult["vehicleClass"],
  premium: number,
): COEResult => ({
  month: "2024-01",
  biddingNo: 1,
  vehicleClass,
  quota: 100,
  bidsSuccess: 80,
  bidsReceived: 120,
  premium,
});

describe("PremiumBanner", () => {
  beforeEach(() => {
    mockStoreState.bannerContent = null;
    mockStoreState.setBannerContent.mockClear();
  });

  const data: COEResult[] = [
    createCoeResult("Category B", 42000),
    createCoeResult("Category A", 40000),
  ];

  it("should populate the global banner with sorted categories and clean up on unmount", () => {
    const { unmount } = render(<PremiumBanner data={data} />);

    expect(mockStoreState.setBannerContent).toHaveBeenCalledTimes(1);
    const bannerNode = mockStoreState.setBannerContent.mock
      .calls[0][0] as ReactElement;
    const { container, getAllByText } = render(bannerNode);
    expect(container).toMatchSnapshot();
    expect(getAllByText(/Category [AB]/)).toHaveLength(2);

    unmount();

    expect(mockStoreState.setBannerContent).toHaveBeenLastCalledWith(null);
  });
});
