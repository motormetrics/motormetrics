import { render, screen } from "@testing-library/react";
import {
  AnimatedCard,
  AnimatedCardGrid,
  AnimatedContainer,
  AnimatedIconWrapper,
  AnimatedSection,
  AnimatedText,
  MaintenancePollingWrapper,
  useMaintenancePolling,
} from "./maintenance-notice.client";

const mockUseMaintenance = vi.fn();

vi.mock("@web/hooks/use-maintenance", () => ({
  useMaintenance: () => mockUseMaintenance(),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      initial,
      animate,
      layout,
      variants,
    }: {
      children?: React.ReactNode;
      className?: string;
      initial?: string;
      animate?: string;
      layout?: boolean;
      variants?: object;
    }) => (
      <div
        data-testid="motion-div"
        data-initial={initial}
        data-animate={animate}
        data-layout={layout ? "true" : "false"}
        data-has-variants={variants ? "true" : "false"}
        className={className}
      >
        {children}
      </div>
    ),
  },
}));

describe("maintenance-notice client helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call maintenance hook in polling helpers", () => {
    useMaintenancePolling();
    render(
      <MaintenancePollingWrapper>
        <span>Polling content</span>
      </MaintenancePollingWrapper>,
    );

    expect(mockUseMaintenance).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Polling content")).toBeVisible();
  });

  it("should render animated wrappers with expected classes", () => {
    const { container } = render(
      <AnimatedContainer>
        <AnimatedSection className="section-class">
          <AnimatedText>
            <span>Maintenance text</span>
          </AnimatedText>
        </AnimatedSection>
        <AnimatedCardGrid>
          <AnimatedCard>
            <span>Card A</span>
          </AnimatedCard>
        </AnimatedCardGrid>
      </AnimatedContainer>,
    );

    expect(container).toMatchSnapshot();
    expect(screen.getByText("Maintenance text")).toBeVisible();
    expect(screen.getByText("Card A")).toBeVisible();
    expect(document.querySelector(".section-class")).toBeTruthy();
    expect(document.querySelector(".grid")).toBeTruthy();
  });

  it("should render animated icon wrapper", () => {
    render(
      <AnimatedIconWrapper>
        <span data-testid="icon">Icon</span>
      </AnimatedIconWrapper>,
    );

    expect(screen.getByTestId("icon")).toBeVisible();
    expect(screen.getAllByTestId("motion-div").length).toBeGreaterThan(1);
  });
});
