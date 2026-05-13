import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import HomePage from "./page";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span aria-label={alt} role="img" />,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@heroui/react", () => {
  const Card = ({ children }: { children: ReactNode }) => (
    <section>{children}</section>
  );
  Card.Header = ({ children }: { children: ReactNode }) => (
    <header>{children}</header>
  );
  Card.Title = ({ children }: { children: ReactNode }) => <h2>{children}</h2>;
  Card.Description = ({ children }: { children: ReactNode }) => (
    <p>{children}</p>
  );
  Card.Content = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );

  const Chip = ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  );
  Chip.Label = ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  );

  const ProgressBar = ({
    "aria-label": ariaLabel,
    children,
    maxValue,
    value,
  }: {
    "aria-label": string;
    children: ReactNode;
    maxValue?: number;
    value: number;
  }) => (
    <div
      aria-label={ariaLabel}
      aria-valuemax={maxValue}
      aria-valuenow={value}
      role="progressbar"
    >
      {children}
    </div>
  );
  ProgressBar.Track = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  ProgressBar.Fill = () => <div />;

  const Separator = () => <hr />;
  const Text = ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  );

  return {
    Card,
    Chip,
    ProgressBar,
    Separator,
    Text,
    cn: (...classes: (string | undefined)[]) =>
      classes.filter(Boolean).join(" "),
  };
});

vi.mock("@heroui-pro/react", () => {
  const KPI = ({ children }: { children: ReactNode }) => (
    <article>{children}</article>
  );
  KPI.Header = ({ children }: { children: ReactNode }) => (
    <header>{children}</header>
  );
  KPI.Icon = ({ children }: { children: ReactNode }) => <span>{children}</span>;
  KPI.Title = ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  );
  KPI.Content = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  KPI.Value = ({ value }: { value: number }) => <span>{value}</span>;
  KPI.Trend = ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  );
  KPI.Progress = () => <div />;
  KPI.Footer = ({ children }: { children: ReactNode }) => (
    <footer>{children}</footer>
  );

  const KPIGroup = ({ children }: { children: ReactNode }) => (
    <div data-testid="kpi-group">{children}</div>
  );
  KPIGroup.Separator = () => <hr data-testid="kpi-group-separator" />;

  const Segment = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  Segment.Item = ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  );

  const Widget = ({ children }: { children: ReactNode }) => (
    <section>{children}</section>
  );
  Widget.Header = ({ children }: { children: ReactNode }) => (
    <header>{children}</header>
  );
  Widget.Title = ({ children }: { children: ReactNode }) => <h2>{children}</h2>;
  Widget.Description = ({ children }: { children: ReactNode }) => (
    <p>{children}</p>
  );
  Widget.Content = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );

  return {
    KPI,
    KPIGroup,
    NumberValue: ({ value }: { value: number }) => <span>{value}</span>,
    Segment,
    TrendChip: ({ children }: { children: ReactNode }) => (
      <span>{children}</span>
    ),
    Widget,
  };
});

vi.mock("@web/components/shared/month-selector", () => ({
  MonthSelector: () => <div>Month selector</div>,
}));

vi.mock("@web/components/structured-data", () => ({
  StructuredData: () => null,
}));

vi.mock(
  "@web/app/(main)/(dashboard)/components/yearly-registrations-chart",
  () => ({
    YearlyRegistrationsChart: () => <div>Yearly chart</div>,
  }),
);

vi.mock("@web/queries/cars", () => ({
  getCarMarketShareData: vi.fn(async (_month: string, type: string) => ({
    data:
      type === "fuelType"
        ? [{ count: 64, name: "Electric", percentage: 64 }]
        : [{ count: 50, name: "Saloon", percentage: 50 }],
  })),
  getCarsComparison: vi.fn(async () => ({
    currentMonth: {
      fuelType: [{ count: 64, label: "Electric" }],
      total: 100,
    },
    previousMonth: {
      fuelType: [{ count: 50, label: "Electric" }],
      total: 100,
    },
  })),
  getCarsLatestMonth: vi.fn(async () => "2026-03"),
  getCarsMonths: vi.fn(async () => [{ month: "2026-03" }]),
  getCategorySummaryByYear: vi.fn(async () => ({
    electric: 64,
    total: 100,
    year: 2026,
  })),
  getTopMakesByYear: vi.fn(async () => [
    { make: "BYD", value: 3239 },
    { make: "Toyota", value: 1932 },
  ]),
  getYearlyRegistrations: vi.fn(async () => [
    { total: 43000, year: 2024 },
    { total: 52700, year: 2025 },
    { total: 13322, year: 2026 },
  ]),
}));

vi.mock("@web/queries/coe", () => ({
  getLatestAndPreviousCoeResults: vi.fn(async () => ({
    latest: [
      {
        biddingNo: 1,
        bidsReceived: 120,
        bidsSuccess: 90,
        month: "2026-04",
        premium: 124790,
        quota: 100,
        vehicleClass: "Category A",
      },
      {
        biddingNo: 1,
        bidsReceived: 100,
        bidsSuccess: 75,
        month: "2026-04",
        premium: 126236,
        quota: 80,
        vehicleClass: "Category B",
      },
    ],
    previous: [
      {
        biddingNo: 1,
        bidsReceived: 120,
        bidsSuccess: 90,
        month: "2026-03",
        premium: 120000,
        quota: 100,
        vehicleClass: "Category A",
      },
      {
        biddingNo: 1,
        bidsReceived: 100,
        bidsSuccess: 75,
        month: "2026-03",
        premium: 121000,
        quota: 80,
        vehicleClass: "Category B",
      },
    ],
  })),
}));

vi.mock("@web/queries/logos", () => ({
  getCarLogo: vi.fn(async () => ({ url: "https://example.com/logo.svg" })),
}));

vi.mock("@web/queries/posts", () => ({
  getRecentPosts: vi.fn(async () => []),
}));

describe("HomePage", () => {
  it("should use COE results as the primary KPI group without the old signal KPI strip", async () => {
    const view = await HomePage({ searchParams: Promise.resolve({}) });

    render(view);

    expect(screen.queryByText("Total Registrations")).not.toBeInTheDocument();

    const kpiGroups = screen.getAllByTestId("kpi-group");
    expect(kpiGroups).toHaveLength(1);
    expect(within(kpiGroups[0]).getByText("Category A")).toBeInTheDocument();
    expect(within(kpiGroups[0]).getByText("Category B")).toBeInTheDocument();
    expect(
      within(kpiGroups[0]).queryByText(/Price increased|Price decreased/),
    ).not.toBeInTheDocument();
    expect(
      within(kpiGroups[0]).getAllByTestId("kpi-group-separator"),
    ).toHaveLength(1);
  });

  it("should show top make counts as progress bars scaled to the leading make", async () => {
    const view = await HomePage({ searchParams: Promise.resolve({}) });

    render(view);

    expect(screen.getByLabelText("BYD registrations progress")).toHaveAttribute(
      "aria-valuenow",
      "3239",
    );
    expect(screen.getByLabelText("BYD registrations progress")).toHaveAttribute(
      "aria-valuemax",
      "3239",
    );
    expect(
      screen.getByLabelText("Toyota registrations progress"),
    ).toHaveAttribute("aria-valuenow", "1932");
    expect(
      screen.getByLabelText("Toyota registrations progress"),
    ).toHaveAttribute("aria-valuemax", "3239");
  });

  it("should not show ranking numbers in Top Makes", async () => {
    const view = await HomePage({ searchParams: Promise.resolve({}) });

    render(view);

    const topMakes = screen.getByRole("heading", { name: "Top Makes" })
      .parentElement?.parentElement;

    expect(topMakes).toBeTruthy();
    expect(
      within(topMakes as HTMLElement).queryByText("1"),
    ).not.toBeInTheDocument();
    expect(
      within(topMakes as HTMLElement).queryByText("2"),
    ).not.toBeInTheDocument();
  });
});
