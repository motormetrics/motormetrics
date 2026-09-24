import { NewChip } from "@web/components/shared/chips";
import { render } from "vitest-browser-react";

describe("NewChip", () => {
  it("should render with default props", async () => {
    const screen = await render(<NewChip />);
    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText("New")).toBeInTheDocument();
  });
});
