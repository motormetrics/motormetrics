import { render, screen } from "@testing-library/react";
import { CategoryInfo } from "@web/app/[locale]/(main)/(dashboard)/cars/registrations/components/category-info";
import { Car } from "lucide-react";
import { vi } from "vitest";

describe("CategoryInfo", () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it("should render with required props", () => {
    render(
      <CategoryInfo
        icon={Car}
        category="Category A"
        description="Cars up to 1600cc and 97kW"
        isSelected={false}
        onToggle={mockOnToggle}
      />,
    );

    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText("Category A")).toBeInTheDocument();
    expect(screen.getByText("Cars up to 1600cc and 97kW")).toBeInTheDocument();
  });

  it("should render with canFilter prop", () => {
    render(
      <CategoryInfo
        icon={Car}
        category="Category A"
        description="Test description"
        canFilter={false}
        isSelected={false}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.getByText("Category A")).toBeInTheDocument();
  });
});
