import { CategoryInfo } from "@web/app/(main)/(dashboard)/cars/registrations/components/category-info";
import { Car } from "lucide-react";
import { vi } from "vitest";
import { render } from "vitest-browser-react";

describe("CategoryInfo", () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it("should render with required props", async () => {
    const screen = await render(
      <CategoryInfo
        icon={Car}
        category="Category A"
        description="Cars up to 1600cc and 97kW"
        isSelected={false}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText("Category A")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Cars up to 1600cc and 97kW"))
      .toBeInTheDocument();
  });

  it("should render with canFilter prop", async () => {
    const screen = await render(
      <CategoryInfo
        icon={Car}
        category="Category A"
        description="Test description"
        canFilter={false}
        isSelected={false}
        onToggle={mockOnToggle}
      />,
    );

    await expect.element(screen.getByText("Category A")).toBeInTheDocument();
  });
});
