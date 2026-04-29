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
    render(<SkeletonText />);
    expect(document.body.firstChild).toMatchSnapshot();
  });

  it("should render SkeletonHeading", () => {
    render(<SkeletonHeading />);
    expect(document.body.firstChild).toMatchSnapshot();
  });

  it("should render SkeletonCard", () => {
    render(<SkeletonCard />);
    expect(document.body.firstChild).toMatchSnapshot();
  });

  it("should render SkeletonChart", () => {
    render(<SkeletonChart />);
    expect(document.body.firstChild).toMatchSnapshot();
  });

  it("should render SkeletonMetricCard", () => {
    render(<SkeletonMetricCard />);
    expect(document.body.firstChild).toMatchSnapshot();
  });

  it("should render SkeletonChartWidget", () => {
    render(<SkeletonChartWidget />);
    expect(document.body.firstChild).toMatchSnapshot();
  });

  it("should render SkeletonPageHeader", () => {
    render(<SkeletonPageHeader />);
    expect(document.body.firstChild).toMatchSnapshot();
  });

  it("should render SkeletonBentoCard", () => {
    render(<SkeletonBentoCard />);
    expect(document.body.firstChild).toMatchSnapshot();
  });

  it("should render SectionSkeleton with title", () => {
    render(
      <SectionSkeleton>
        <SkeletonCard />
      </SectionSkeleton>,
    );
    expect(document.body.firstChild).toMatchSnapshot();
  });

  it("should render SectionSkeleton without title", () => {
    render(
      <SectionSkeleton title={false}>
        <SkeletonCard />
      </SectionSkeleton>,
    );
    expect(document.body.firstChild).toMatchSnapshot();
  });

  it("should render GridSkeleton", () => {
    render(<GridSkeleton count={4} />);
    expect(document.body.firstChild).toMatchSnapshot();
  });

  it("should render ListSkeleton", () => {
    render(<ListSkeleton count={3} />);
    expect(document.body.firstChild).toMatchSnapshot();
  });
});
