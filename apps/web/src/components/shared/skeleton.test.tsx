import { render } from "vitest-browser-react";
import {
  GridSkeleton,
  ListSkeleton,
  SkeletonBentoCard,
  SkeletonCard,
  SkeletonChart,
} from "./skeleton";

describe("Skeleton components", () => {
  it("should render SkeletonCard", async () => {
    const screen = await render(<SkeletonCard />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render SkeletonChart", async () => {
    const screen = await render(<SkeletonChart />);
    expect(screen.container).toMatchSnapshot();
  });

  it("should render SkeletonBentoCard", async () => {
    const screen = await render(<SkeletonBentoCard />);
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
