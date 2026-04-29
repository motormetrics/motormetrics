import { render, screen } from "@testing-library/react";
import { MakeCard } from "./make-card";

describe("MakeCard", () => {
  const germanMakes = ["AUDI", "BMW", "MERCEDES BENZ", "VOLKSWAGEN"];
  const mockMake = germanMakes[1];
  const mockLogoUrl = "https://blob.vercel-storage.com/logos/bmw.png";

  it("should render the make name", () => {
    render(<MakeCard make={mockMake} logoUrl={mockLogoUrl} />);
    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText(mockMake)).toBeVisible();
  });

  it("should render the logo with the correct alt text when logoUrl is provided", () => {
    render(<MakeCard make={mockMake} logoUrl={mockLogoUrl} />);
    expect(screen.getByRole("img", { name: `${mockMake} logo` })).toBeVisible();
  });

  it("should not render the logo when logoUrl is not provided", () => {
    render(<MakeCard make={mockMake} />);
    expect(
      screen.queryByRole("img", { name: `${mockMake} logo` }),
    ).not.toBeInTheDocument();
  });

  it("should render registration count and market share when stats are provided", () => {
    render(<MakeCard make={mockMake} count={1234} share={12.5} />);
    expect(screen.getByText("1,234")).toBeVisible();
    expect(screen.getByText("regs")).toBeVisible();
    expect(screen.getByText(/12\.5%/)).toBeVisible();
  });

  it("should not render stats when count and share are not provided", () => {
    render(<MakeCard make={mockMake} />);
    expect(screen.queryByText(/regs/)).not.toBeInTheDocument();
    expect(screen.queryByText(/share/)).not.toBeInTheDocument();
  });

  it("should not render stats when only count is provided", () => {
    render(<MakeCard make={mockMake} count={1234} />);
    expect(screen.queryByText(/regs/)).not.toBeInTheDocument();
  });

  it("should render positive YoY growth chip when yoyChange is positive", () => {
    render(
      <MakeCard make={mockMake} count={1234} share={12.5} yoyChange={8.3} />,
    );
    expect(screen.getByText("+8.3%")).toBeVisible();
  });

  it("should render negative YoY growth chip when yoyChange is negative", () => {
    render(
      <MakeCard make={mockMake} count={1234} share={12.5} yoyChange={-5.2} />,
    );
    expect(screen.getByText("-5.2%")).toBeVisible();
  });

  it("should not render YoY growth chip when yoyChange is null", () => {
    render(
      <MakeCard make={mockMake} count={1234} share={12.5} yoyChange={null} />,
    );
    expect(screen.queryByText(/[+-]\d+\.\d+%/)).not.toBeInTheDocument();
  });

  it("should not render YoY growth chip when yoyChange is not provided", () => {
    render(<MakeCard make={mockMake} count={1234} share={12.5} />);
    expect(screen.queryByText(/[+-]\d+\.\d+%/)).not.toBeInTheDocument();
  });
});
