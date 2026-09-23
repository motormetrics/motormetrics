import { render } from "vitest-browser-react";
import {
  GridSkeleton,
  ListSkeleton,
  SectionSkeleton,
  SkeletonBentoCard,
  SkeletonCard,
  SkeletonChart,
  SkeletonChartWidget,
  SkeletonHeading,
  SkeletonMetricCard,
  SkeletonPageHeader,
  SkeletonText,
} from "./skeleton";

describe("Skeleton components", () => {
  it("should render SkeletonText", async () => {
    const screen = await render(<SkeletonText />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render SkeletonHeading", async () => {
    const screen = await render(<SkeletonHeading />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render SkeletonCard", async () => {
    const screen = await render(<SkeletonCard />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render SkeletonChart", async () => {
    const screen = await render(<SkeletonChart />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render SkeletonMetricCard", async () => {
    const screen = await render(<SkeletonMetricCard />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render SkeletonChartWidget", async () => {
    const screen = await render(<SkeletonChartWidget />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render SkeletonPageHeader", async () => {
    const screen = await render(<SkeletonPageHeader />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render SkeletonBentoCard", async () => {
    const screen = await render(<SkeletonBentoCard />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render SectionSkeleton with title", async () => {
    const screen = await render(
      <SectionSkeleton>
        <SkeletonCard />
      </SectionSkeleton>,
    );
    expect(screen.container).toMatchSnapshot();
  });

  it("should render SectionSkeleton without title", async () => {
    const screen = await render(
      <SectionSkeleton title={false}>
        <SkeletonCard />
      </SectionSkeleton>,
    );
    expect(screen.container).toMatchSnapshot();
  });

  it("should render GridSkeleton", async () => {
    const screen = await render(<GridSkeleton count={4} />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render ListSkeleton", async () => {
    const screen = await render(<ListSkeleton count={3} />);
    expect(screen.container).toMatchSnapshot();
  });
});
