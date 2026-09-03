import { render } from "@testing-library/react";
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
  it("should render SkeletonText", () => {
    const { container } = render(<SkeletonText />);
    expect(container).toMatchSnapshot();
  });

  it("should render SkeletonHeading", () => {
    const { container } = render(<SkeletonHeading />);
    expect(container).toMatchSnapshot();
  });

  it("should render SkeletonCard", () => {
    const { container } = render(<SkeletonCard />);
    expect(container).toMatchSnapshot();
  });

  it("should render SkeletonChart", () => {
    const { container } = render(<SkeletonChart />);
    expect(container).toMatchSnapshot();
  });

  it("should render SkeletonMetricCard", () => {
    const { container } = render(<SkeletonMetricCard />);
    expect(container).toMatchSnapshot();
  });

  it("should render SkeletonChartWidget", () => {
    const { container } = render(<SkeletonChartWidget />);
    expect(container).toMatchSnapshot();
  });

  it("should render SkeletonPageHeader", () => {
    const { container } = render(<SkeletonPageHeader />);
    expect(container).toMatchSnapshot();
  });

  it("should render SkeletonBentoCard", () => {
    const { container } = render(<SkeletonBentoCard />);
    expect(container).toMatchSnapshot();
  });

  it("should render SectionSkeleton with title", () => {
    const { container } = render(
      <SectionSkeleton>
        <SkeletonCard />
      </SectionSkeleton>,
    );
    expect(container).toMatchSnapshot();
  });

  it("should render SectionSkeleton without title", () => {
    const { container } = render(
      <SectionSkeleton title={false}>
        <SkeletonCard />
      </SectionSkeleton>,
    );
    expect(container).toMatchSnapshot();
  });

  it("should render GridSkeleton", () => {
    const { container } = render(<GridSkeleton count={4} />);
    expect(container).toMatchSnapshot();
  });

  it("should render ListSkeleton", () => {
    const { container } = render(<ListSkeleton count={3} />);
    expect(container).toMatchSnapshot();
  });
});
