import { render } from "vitest-browser-react";
import { NewChip } from "./chips";

describe("NewChip", () => {
  it("should render with default props", async () => {
    const screen = await render(<NewChip />);
    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText("New")).toBeInTheDocument();
  });
});
