import {
  AnimatedCard,
  AnimatedCardGrid,
  AnimatedContainer,
  AnimatedIconWrapper,
  AnimatedSection,
  AnimatedText,
  MaintenancePollingWrapper,
  useMaintenancePolling,
} from "@web/app/(main)/(site)/maintenance/components/maintenance-notice.client";
import { render } from "vitest-browser-react";

const mockUseMaintenance = vi.fn();

vi.mock("@web/app/(main)/(site)/maintenance/hooks/use-maintenance", () => ({
  useMaintenance: () => mockUseMaintenance(),
}));

vi.mock("motion/react-client", () => ({
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
}));

describe("maintenance-notice client helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call maintenance hook in polling helpers", async () => {
    useMaintenancePolling();
    const screen = await render(
      <MaintenancePollingWrapper>
        <span>Polling content</span>
      </MaintenancePollingWrapper>,
    );

    expect(mockUseMaintenance).toHaveBeenCalledTimes(2);
    await expect.element(screen.getByText("Polling content")).toBeVisible();
  });

  it("should render animated wrappers with expected classes", async () => {
    const screen = await render(
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

    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText("Maintenance text")).toBeVisible();
    await expect.element(screen.getByText("Card A")).toBeVisible();
    expect(document.querySelector(".section-class")).toBeTruthy();
    expect(document.querySelector(".grid")).toBeTruthy();
  });

  it("should render animated icon wrapper", async () => {
    const screen = await render(
      <AnimatedIconWrapper>
        <span data-testid="icon">Icon</span>
      </AnimatedIconWrapper>,
    );

    await expect.element(screen.getByTestId("icon")).toBeVisible();
    expect(screen.getByTestId("motion-div").elements().length).toBeGreaterThan(
      1,
    );
  });
});
